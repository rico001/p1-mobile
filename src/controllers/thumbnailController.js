// ftpController.js
import ftpService from "../services/ftpService.js"
import path from 'path';
import fs from 'fs/promises';
import thumbnailService from "../services/thumbnailService.js";



export const generateThumbnails = async (req, res) => {
    try {
      const requestedFileName = req.query.fileName; // optionaler Filter
      const remoteDir = '/';
      const fileType = '3mf';
  
      // 1. Liste aller 3MF-Dateien im Remote-Verzeichnis
      const files = await ftpService.listFiles(remoteDir);
      let targets = files.filter(f =>
        f.name.toLowerCase().endsWith(`.${fileType.toLowerCase()}`)
      );
  
      // 2. Wenn ein fileName-Query übergeben wurde, nur dieses eine File bearbeiten
      if (requestedFileName) {
        targets = targets.filter(f => f.name.toLowerCase() === requestedFileName.toLowerCase());
        if (targets.length === 0) {
          return res.status(404).json({ message: `File "${requestedFileName}" nicht gefunden.` });
        }
      }
  
      // 3. Lokale Ordner für Downloads und Thumbnails anlegen
      const tmpDir = path.resolve(process.cwd(), 'files');
      const thumbDir = path.resolve(process.cwd(), 'thumbnails');
      await fs.mkdir(tmpDir, { recursive: true });
      await fs.mkdir(thumbDir, { recursive: true });
  
      const results = [];
  
      for (const file of targets) {
        const localFilePath = path.resolve(tmpDir, file.name);
  
        // 4. Herunterladen
        console.log(`Lade ${file.name} herunter...`);
        await ftpService.downloadFile(
          path.posix.join(remoteDir, file.name),
          localFilePath
        );
        console.log(`Herunterladen von ${file.name} abgeschlossen.`);
  
        // 5. Thumbnail extrahieren
        const baseName = path.parse(file.name).name;
        const thumbnailFileName = `${baseName}.png`;
        const thumbnailPath = path.resolve(thumbDir, thumbnailFileName);
        await thumbnailService.extractThumbnail(localFilePath, thumbnailPath);
  
        // 7. Ergebnis sammeln
        results.push({
          message: 'success',
          command: 'generateThumbnails',
          fileName: file.name,
          refreshedThumbnail: `/thumbnails/${thumbnailFileName}`
        });
      }
  
      // 8. Antwort
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  };