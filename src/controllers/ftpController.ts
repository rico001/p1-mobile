import { Request, Response } from 'express';
import ftpService from '../services/ftpService';
import path from 'path';
import fs from 'fs';
import { thumbnailService } from '../services/thumbnailService';

interface FileInfo {
  name: string;
  size: number;
}

interface FileResponse {
  name: string;
  size: number;
  thumbnail: string | null;
  operations: {
    download: { method: string; path: string };
    delete: { method: string; path: string };
    refreshThumbnail: { method: string; path: string };
    print: { method: string; path: string };
    rename: { method: string; path: string };
  };
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
    const fileType = (req.query.type as string) || '3mf';
    const files: FileInfo[] = await ftpService.listFiles('/');
    let filteredFiles = files;

    if (fileType) {
      filteredFiles = files.filter(file =>
        file.name.toLowerCase().endsWith(`.${fileType.toLowerCase()}`)
      );
    }

    const response: FileResponse[] = filteredFiles.map(file => {
      const baseName = file.name;
      const thumb = thumbnailFiles.find(fn => fn.startsWith(baseName));
      return {
        name: baseName,
        size: file.size,
        thumbnail: thumb ? path.posix.join('/thumbnails', thumb) : null,
        operations: {
          download: {
            method: 'GET',
            path: path.posix.join('/api/ftp/download-file', `?fileName=${baseName}`),
          },
          delete: {
            method: 'GET',
            path: path.posix.join('/api/ftp/delete-file', `?fileName=${baseName}`),
          },
          refreshThumbnail: {
            method: 'GET',
            path: path.posix.join('/api/thumbnail/files', `?fileName=${baseName}`),
          },
          print: {
            method: 'GET',
            path: path.posix.join('/api/mqtt/print-file', `?fileName=${baseName}`),
          },
          rename: {
            method: 'GET',
            path: path.posix.join('/api/ftp/rename-file', `?oldFileName=${baseName}`),
          },
        },
      };
    });

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

    if (await ftpService.fileExists(originalName)) {
      res.status(409).json({ message: 'Dateinname bereits vergeben.', type: 'fileExists' });
      return;
    }

    const fileLocalPath = path.resolve(process.cwd(), 'files', originalName);
    const remotePath = path.posix.join('/', originalName);
    await ftpService.uploadFile(fileLocalPath, remotePath);

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

// GET /api/ftp/rename-file
export const renameFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const oldFileName = req.query.oldFileName as string;
    const newFileName = req.query.newFileName as string;
    console.log('renameFile', `${oldFileName} -> ${newFileName}`);

    await ftpService.renameFile(oldFileName, `${newFileName}.3mf`);

    const oldThumb = path.resolve(process.cwd(), 'thumbnails', `${oldFileName}.png`);
    const newThumb = path.resolve(
      process.cwd(),
      'thumbnails',
      `${newFileName}.3mf.png`
    );
    thumbnailService.renameThumbnail(oldThumb, newThumb);

    res.json({ message: 'success', command: 'renameFile', fileName: newFileName });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/ftp/download-file
export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const fileName = req.query.fileName as string;
    if (!fileName) {
      res.status(400).json({ message: 'fileName ist erforderlich.' });
      return;
    }

    const localDir = path.resolve(process.cwd(), 'files');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const localPath = path.join(localDir, fileName);
    await ftpService.downloadFile(path.posix.join('/', fileName), localPath);

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
    const fileName = req.query.fileName as string;
    if (!fileName) {
      res.status(400).json({ message: 'fileName ist erforderlich.' });
      return;
    }

    await ftpService.deleteFile(fileName);
    const thumbPath = path.resolve(
      process.cwd(),
      'thumbnails',
      `${fileName}.png`
    );
    thumbnailService.deleteThumbnail(thumbPath);

    res.json({ message: 'success', command: 'deleteFile', fileName });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
