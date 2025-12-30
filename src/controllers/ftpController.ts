import { Request, Response } from 'express';
import ftpService from '../services/ftpService';
import path from 'path';
import fs from 'fs';
import { thumbnailService } from '../services/thumbnailService';
import { FileInfo as FtpFileInfo } from 'basic-ftp';

interface FileResponse {
  name: string;
  size: number;
  type: 'file' | 'folder';
  path: string;
  thumbnail: string | null;
  operations: {
    download?: { method: string; path: string };
    delete: { method: string; path: string };
    refreshThumbnail?: { method: string; path: string };
    print?: { method: string; path: string };
    rename: { method: string; path: string };
    move: { method: string; path: string };
  };
}

interface MoveRequest {
  sourcePath: string;
  targetFolder: string;
}

// GET /api/ftp/list-files
export const listFiles = async (req: Request, res: Response): Promise<void> => {
  const thumbnailsDir = path.resolve(process.cwd(), 'thumbnails');
  let thumbnailFiles: string[] = [];

  try {
    thumbnailFiles = await fs.promises.readdir(thumbnailsDir);
  } catch {
    // Folder might not exist or be empty
  }

  try {
    const currentPath = (req.query.path as string) || '/';
    const fileType = (req.query.type as string) || '3mf';

    const items: FtpFileInfo[] = await ftpService.listFilesAndFolders(currentPath);

    const response: FileResponse[] = items
      .map(item => {
        const isFolder = item.isDirectory;
        const itemPath = path.posix.join(currentPath, item.name);

        // Filtere "thumbnail"-Ordner im /timelapse-Verzeichnis aus
        if (isFolder && currentPath === '/timelapse' && item.name.toLowerCase() === 'thumbnail') {
          return null;
        }

        if (isFolder) {
          return {
            name: item.name,
            size: 0,
            type: 'folder' as const,
            path: itemPath,
            thumbnail: null,
            operations: {
              delete: { method: 'DELETE', path: `/api/ftp/delete-folder?path=${encodeURIComponent(itemPath)}` },
              rename: { method: 'POST', path: `/api/ftp/rename-folder?path=${encodeURIComponent(itemPath)}` },
              move: { method: 'POST', path: `/api/ftp/move?sourcePath=${encodeURIComponent(itemPath)}` }
            }
          };
        }

        // Nur Dateien mit gewünschtem Typ
        if (!item.name.toLowerCase().endsWith(`.${fileType.toLowerCase()}`)) {
          return null;
        }

        // Thumbnail-Handling (nur für 3MF-Dateien, nur nach Dateinamen)
        let thumbnailPath = null;

        if (fileType.toLowerCase() === '3mf') {
          const thumb = thumbnailFiles.find(fn => fn === `${item.name}.png`);
          thumbnailPath = thumb ? path.posix.join('/thumbnails', thumb) : null;
        }

        return {
          name: item.name,
          size: item.size,
          type: 'file' as const,
          path: itemPath,
          thumbnail: thumbnailPath,
          operations: {
            download: {
              method: 'GET',
              path: `/api/ftp/download-file?path=${encodeURIComponent(itemPath)}`,
            },
            delete: {
              method: 'DELETE',
              path: `/api/ftp/delete-file?path=${encodeURIComponent(itemPath)}`,
            },
            refreshThumbnail: {
              method: 'GET',
              path: `/api/thumbnail/files?path=${encodeURIComponent(itemPath)}`,
            },
            print: {
              method: 'GET',
              path: `/api/mqtt/print-file?path=${encodeURIComponent(itemPath)}`,
            },
            rename: {
              method: 'POST',
              path: `/api/ftp/rename-file?path=${encodeURIComponent(itemPath)}`,
            },
            move: {
              method: 'POST',
              path: `/api/ftp/move?sourcePath=${encodeURIComponent(itemPath)}`,
            },
          },
        };
      })
      .filter(Boolean) as FileResponse[];

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ftp/upload-file
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Keine Datei im Feld 'file' gefunden." });
      return;
    }

    const originalName = req.file.originalname;
    if (!originalName.toLowerCase().endsWith('.3mf')) {
      res.status(400).json({ message: 'Nur 3mf-Dateien sind erlaubt.' });
      return;
    }

    const parentPath = req.body.parentPath || '/';
    const remotePath = path.posix.join(parentPath, originalName);

    // Prüfe ob Dateiname global bereits existiert (über alle Ordner hinweg)
    const existingFile = await ftpService.findFileByName(originalName);
    if (existingFile) {
      res.status(409).json({
        message: `Dateiname bereits vergeben: "${originalName}"`,
        type: 'fileExists'
      });
      return;
    }

    const fileLocalPath = path.resolve(process.cwd(), 'files', originalName);
    await ftpService.uploadFile(fileLocalPath, remotePath);

    // Thumbnail-Name basierend nur auf Dateinamen (ohne Pfad)
    const thumbnailPath = path.resolve(
      process.cwd(),
      'thumbnails',
      `${originalName}.png`
    );
    try {
      await thumbnailService.extractThumbnail(fileLocalPath, thumbnailPath);
    } catch (thumbErr) {
      console.error(`Fehler beim Generieren des Thumbnails für ${fileLocalPath}`, thumbErr);
    }

    res.json({ message: 'Datei erfolgreich hochgeladen.' });
  } catch (error: any) {
    console.error('Upload-Fehler:', error);
    res.status(500).json({ message: error.message });
  } finally {
    if (req.file) {
      const fileLocalPath = path.resolve(process.cwd(), 'files', req.file.originalname);
      fs.unlink(fileLocalPath, err => {
        if (err) console.error('Fehler beim Löschen der Datei:', err);
      });
    }
  }
};

// POST /api/ftp/rename-file
export const renameFile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Unterstütze beide: path (neu) und oldFileName (alt)
    const filePath = (req.query.path as string) || (req.query.oldFileName as string);
    const newFileName = req.query.newFileName as string || req.body.newName;

    if (!filePath || !newFileName) {
      res.status(400).json({ message: 'path/oldFileName und newFileName/newName sind erforderlich.' });
      return;
    }

    console.log('renameFile', `${filePath} -> ${newFileName}`);

    const parentPath = path.dirname(filePath);
    const newPath = path.posix.join(parentPath, `${newFileName}.3mf`);
    const newFullFileName = `${newFileName}.3mf`;

    // Prüfe ob neuer Dateiname global bereits existiert (außer die aktuelle Datei)
    const existingFile = await ftpService.findFileByName(newFullFileName);
    if (existingFile && existingFile !== filePath) {
      res.status(409).json({
        message: `Dateiname bereits vergeben: "${newFullFileName}"`,
        type: 'fileExists',
        existingPath: existingFile
      });
      return;
    }

    await ftpService.moveFile(filePath, newPath);

    // Thumbnail umbenennen (nur Dateiname, kein Pfad)
    const oldFileName = path.basename(filePath);
    const oldThumb = path.resolve(process.cwd(), 'thumbnails', `${oldFileName}.png`);
    const newThumb = path.resolve(process.cwd(), 'thumbnails', `${newFullFileName}.png`);

    try {
      await thumbnailService.renameThumbnail(oldThumb, newThumb);
    } catch (err) {
      console.warn('Thumbnail konnte nicht umbenannt werden:', err);
    }

    res.json({ message: 'success', command: 'renameFile', fileName: newFileName });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/ftp/download-file
export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Unterstütze beide: path (neu) und fileName (alt)
    const filePath = (req.query.path as string) || (req.query.fileName as string);
    if (!filePath) {
      res.status(400).json({ message: 'path oder fileName ist erforderlich.' });
      return;
    }

    const fileName = path.basename(filePath);

    const localDir = path.resolve(process.cwd(), 'files');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const localPath = path.join(localDir, fileName);
    await ftpService.downloadFile(filePath, localPath);

    // Setze Content-Type basierend auf Dateiendung
    const ext = path.extname(fileName).toLowerCase();
    if (ext === '.avi') {
      res.set('Content-Type', 'video/x-msvideo');
    }

    res.download(localPath, fileName, err => {
      if (err) {
        console.error('Fehler beim Senden der Datei:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Fehler beim Senden der Datei.' });
        }
      } else {
        fs.unlink(localPath, unlinkErr => {
          if (unlinkErr) console.warn('Konnte temporäre Datei nicht löschen:', unlinkErr);
        });
      }
    });
  } catch (error: any) {
    console.error('Download-Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/ftp/delete-file
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Unterstütze beide: path (neu) und fileName (alt)
    const filePath = (req.query.path as string) || (req.query.fileName as string);
    if (!filePath) {
      res.status(400).json({ message: 'path oder fileName ist erforderlich.' });
      return;
    }

    await ftpService.deleteFile(filePath);

    // Thumbnail löschen (nur Dateiname, kein Pfad)
    const fileName = path.basename(filePath);
    const thumbPath = path.resolve(process.cwd(), 'thumbnails', `${fileName}.png`);

    try {
      await thumbnailService.deleteThumbnail(thumbPath);
    } catch (err) {
      console.warn('Thumbnail konnte nicht gelöscht werden:', err);
    }

    res.json({ message: 'success', command: 'deleteFile', fileName: path.basename(filePath) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ftp/create-folder
export const createFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { folderName, parentPath = '/' } = req.body;

    if (!folderName || !folderName.trim()) {
      res.status(400).json({ message: 'folderName ist erforderlich.' });
      return;
    }

    const newFolderPath = path.posix.join(parentPath, folderName);
    await ftpService.createFolder(newFolderPath);

    res.json({ message: 'Ordner erfolgreich erstellt.', path: newFolderPath });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/ftp/delete-folder
export const deleteFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const folderPath = req.query.path as string;

    if (!folderPath) {
      res.status(400).json({ message: 'path ist erforderlich.' });
      return;
    }

    await ftpService.deleteFolder(folderPath);
    res.json({ message: 'Ordner erfolgreich gelöscht.', path: folderPath });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ftp/move
export const moveItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sourcePath, targetFolder } = req.body as MoveRequest;

    if (!sourcePath || !targetFolder) {
      res.status(400).json({ message: 'sourcePath und targetFolder sind erforderlich.' });
      return;
    }

    // Verhindere Verschieben eines Ordners in sich selbst
    if (targetFolder.startsWith(sourcePath + '/')) {
      res.status(400).json({
        message: 'Ein Ordner kann nicht in sich selbst verschoben werden.'
      });
      return;
    }

    const fileName = path.basename(sourcePath);
    const newPath = path.posix.join(targetFolder, fileName);

    // Bei 3MF-Dateien: Prüfe global, ob der Name bereits existiert (außer die Quelldatei selbst)
    if (fileName.toLowerCase().endsWith('.3mf')) {
      const existingFile = await ftpService.findFileByName(fileName);
      if (existingFile && existingFile !== sourcePath) {
        res.status(409).json({
          message: `Dateiname bereits vergeben: "${fileName}"`,
          code: 'TARGET_EXISTS',
          existingPath: existingFile
        });
        return;
      }
    } else {
      // Bei Ordnern: Prüfe nur im Zielordner
      const targetItems = await ftpService.listFilesAndFolders(targetFolder);
      const exists = targetItems.some(item => item.name === fileName);

      if (exists) {
        res.status(409).json({
          message: 'Eine Datei/Ordner mit diesem Namen existiert bereits im Zielordner.',
          code: 'TARGET_EXISTS'
        });
        return;
      }
    }

    await ftpService.moveFile(sourcePath, newPath);

    // Thumbnail bleibt unverändert (nur Dateiname, kein Pfad)
    // Da sich der Dateiname beim Verschieben nicht ändert, bleibt auch das Thumbnail gleich

    res.json({
      message: 'Erfolgreich verschoben.',
      oldPath: sourcePath,
      newPath
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ftp/rename-folder
export const renameFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const oldPath = req.query.path as string;
    const { newName } = req.body;

    if (!oldPath || !newName) {
      res.status(400).json({ message: 'path und newName sind erforderlich.' });
      return;
    }

    const parentPath = path.dirname(oldPath);
    const newPath = path.posix.join(parentPath, newName);

    await ftpService.renameFile(oldPath, newPath);

    res.json({ message: 'Ordner umbenannt.', oldPath, newPath });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
