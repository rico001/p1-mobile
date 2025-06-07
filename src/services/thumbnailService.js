import AdmZip from 'adm-zip'; // Stelle sicher, dass adm-zip installiert ist
import path from 'path';
import fs from 'fs';
import { delay } from '../utils/functions.js';

class ThumbnailService {
  constructor() {

    //erstelle den thumbnail Ordner, falls er nicht existiert
    const thumbnailDir = path.resolve(process.cwd(), 'thumbnails');
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    //erstelle files Ordner, falls er nicht existiert
    const filesDir = path.resolve(process.cwd(), 'files');
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }
  }

  async renameThumbnail(oldPath, newPath) {
    try {
      await fs.promises.rename(oldPath, newPath);
      console.log(`Thumbnail ${oldPath} umbenannt in ${newPath}`);
    }
    catch (error) {
      console.error(`Fehler beim Umbenennen des Thumbnails ${oldPath}:`, error);
    }
  }

  async __extractThumbnailFrom3mf(filePath) {
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();

    console.log("--------- 3mf Inhalte ---------");
    const thumbnailEntry = zipEntries.find(entry => {
      console.log(entry.entryName)
      return entry.entryName.toLowerCase().endsWith('.png');
    });
    console.log("--------- Ende 3mf Inhalte ---------");
    
    if (thumbnailEntry) {
      const thumbnailBuffer = thumbnailEntry.getData(); // Buffer direkt zurückgeben
      return thumbnailBuffer;
    }
    return null;
  }

  async extractThumbnail(filelocalPath, thumbnailPath) {

    let buffer;
    try {
      buffer = await this.__extractThumbnailFrom3mf(filelocalPath);
      if (buffer) {
        await fs.promises.writeFile(thumbnailPath, buffer);
      }
    } catch (error) {
      console.error(`Fehler beim Generieren des Thumbnails für ${filelocalPath}`, error);
    }
  }

  async deleteThumbnail(thumbnailPath) {
    try {
      await fs.promises.unlink(thumbnailPath);
      console.log(`Thumbnail ${thumbnailPath} gelöscht.`);
    } catch (error) {
      console.error(`Fehler beim Löschen des Thumbnails ${thumbnailPath}:`, error);
    }
  }

}

// Singleton-Export: die Konfiguration bleibt, aber Browser-Instanzen fresh
export default new ThumbnailService();
