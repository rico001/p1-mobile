import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import ftpService from '../services/ftpService';
import { thumbnailService } from '../services/thumbnailService';
/**
 * Generiert Thumbnails für 3MF-Dateien im FTP-Server.
 * Optionales Query-Param 'path' für eine spezifische Datei (unterstützt auch 'fileName' für Abwärtskompatibilität).
 */
export async function generateThumbnails(req: Request, res: Response): Promise<void> {
  try {
    // Unterstütze beide: path (neu) und fileName (alt)
    const filePath = (req.query.path as string) || (req.query.fileName as string) || null;

    if (!filePath) {
      res.status(400).json({ message: 'Parameter "path" ist erforderlich.' });
      return;
    }

    // 1. Lokale Ordner für Downloads und Thumbnails anlegen
    const tmpDir = path.resolve(process.cwd(), 'files');
    const thumbDir = path.resolve(process.cwd(), 'thumbnails');
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.mkdir(thumbDir, { recursive: true });

    const fileName = path.basename(filePath);
    const localFilePath = path.resolve(tmpDir, fileName);

    // 2. Datei vom FTP herunterladen
    console.log(`[Thumbnail] Lade ${filePath} herunter...`);
    await ftpService.downloadFile(filePath, localFilePath);
    console.log(`[Thumbnail] Download abgeschlossen: ${fileName}`);

    // 3. Thumbnail extrahieren (nur Dateiname, kein Pfad)
    const thumbnailFileName = `${fileName}.png`;
    const thumbnailPath = path.resolve(thumbDir, thumbnailFileName);
    await thumbnailService.extractThumbnail(localFilePath, thumbnailPath);

    console.log(`[Thumbnail] Thumbnail erstellt: ${thumbnailFileName}`);

    // 4. Lokale Datei aufräumen
    try {
      await fs.unlink(localFilePath);
    } catch (err) {
      console.warn('[Thumbnail] Konnte temporäre Datei nicht löschen:', err);
    }

    // 5. Erfolg zurückmelden
    res.json({
      message: 'success',
      command: 'generateThumbnails',
      fileName: fileName,
      path: filePath,
      refreshedThumbnail: `/thumbnails/${thumbnailFileName}`,
    });
  } catch (err: any) {
    console.error('[Thumbnail] Fehler:', err);
    res.status(500).json({ message: err.message });
  }
}
