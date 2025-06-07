import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import ftpService from '../services/ftpService';
import { thumbnailService } from '../services/thumbnailService';
/**
 * Generiert Thumbnails für 3MF-Dateien im FTP-Server.
 * Optionales Query-Param 'fileName' filtert auf eine Datei.
 */
export async function generateThumbnails(req: Request, res: Response): Promise<void> {
  try {
    const requestedFileName = (req.query.fileName as string) || null;
    const remoteDir = '/';
    const fileType = '3mf';

    // 1. Liste aller 3MF-Dateien im Remote-Verzeichnis
    const files: Array<{ name: string }> = await ftpService.listFiles(remoteDir);
    let targets = files.filter(f => f.name.toLowerCase().endsWith(`.${fileType.toLowerCase()}`));

    // 2. Auf Wunsch nur eine bestimmte Datei bearbeiten
    if (requestedFileName) {
      targets = targets.filter(f => f.name.toLowerCase() === requestedFileName.toLowerCase());
      if (targets.length === 0) {
        res.status(404).json({ message: `File "${requestedFileName}" nicht gefunden.` });
        return;
      }
    }

    // 3. Lokale Ordner für Downloads und Thumbnails anlegen
    const tmpDir = path.resolve(process.cwd(), 'files');
    const thumbDir = path.resolve(process.cwd(), 'thumbnails');
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.mkdir(thumbDir, { recursive: true });

    const results: Array<{ message: string; command: string; fileName: string; refreshedThumbnail: string }> = [];

    for (const file of targets) {
      const localFilePath = path.resolve(tmpDir, file.name);

      // 4. Herunterladen
      console.log(`Lade ${file.name} herunter...`);
      await ftpService.downloadFile(path.posix.join(remoteDir, file.name), localFilePath);
      console.log(`Herunterladen von ${file.name} abgeschlossen.`);

      // 5. Thumbnail extrahieren
      const baseName = file.name;
      const thumbnailFileName = `${baseName}.png`;
      const thumbnailPath = path.resolve(thumbDir, thumbnailFileName);
      await thumbnailService.extractThumbnail(localFilePath, thumbnailPath);

      // 6. Ergebnis sammeln
      results.push({
        message: 'success',
        command: 'generateThumbnails',
        fileName: file.name,
        refreshedThumbnail: `/thumbnails/${thumbnailFileName}`,
      });
    }

    // 7. Antwort senden
    res.json(results);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}
