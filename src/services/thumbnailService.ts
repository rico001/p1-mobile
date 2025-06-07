import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const rename = promisify(fs.rename);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

class ThumbnailService {
  private thumbnailDir: string;
  private filesDir: string;

  constructor(thumbnailDir: string, filesDir: string) {
    this.thumbnailDir = path.resolve(process.cwd(), thumbnailDir);
    this.filesDir = path.resolve(process.cwd(), filesDir);

    this.ensureDir(this.thumbnailDir);
    this.ensureDir(this.filesDir);
  }

  /** Stellt sicher, dass ein Verzeichnis existiert */
  private async ensureDir(dir: string): Promise<void> {
    if (!(await exists(dir))) {
      await mkdir(dir, { recursive: true });
    }
  }

  /**
   * Extrahiert das erste PNG aus einer .3mf (ZIP) und liefert den Buffer zurück.
   * @param filePath Pfad zur .3mf-Datei
   * @returns Buffer des PNG-Thumbnails oder null, wenn keines gefunden
   */
  private async extractThumbnailBuffer(filePath: string): Promise<Buffer | null> {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();

    for (const entry of entries) {
      if (entry.entryName.toLowerCase().endsWith('.png')) {
        return entry.getData();
      }
    }
    return null;
  }

  /**
   * Extrahiert ein Thumbnail aus der .3mf-Datei und speichert es.
   * @param sourcePath Pfad zur .3mf-Datei
   * @param targetPath Zielpfad für das PNG-Thumbnail
   */
  public async extractThumbnail(sourcePath: string, targetPath: string): Promise<void> {
    try {
      const buffer = await this.extractThumbnailBuffer(sourcePath);
      if (buffer) {
        await writeFile(targetPath, buffer);
        console.log(`Thumbnail erstellt: ${targetPath}`);
      } else {
        console.warn(`Kein PNG-Thumbnail in ${sourcePath} gefunden.`);
      }
    } catch (err: any) {
      console.error(`Fehler beim Generieren des Thumbnails für ${sourcePath}:`, err);
    }
  }

  /**
   * Bennent ein Thumbnail um.
   * @param oldPath Aktueller Pfad
   * @param newPath Neuer Pfad
   */
  public async renameThumbnail(oldPath: string, newPath: string): Promise<void> {
    try {
      await rename(oldPath, newPath);
      console.log(`Thumbnail umbenannt: ${oldPath} → ${newPath}`);
    } catch (err: any) {
      console.error(`Fehler beim Umbenennen des Thumbnails ${oldPath}:`, err);
    }
  }

  /**
   * Löscht ein Thumbnail.
   * @param thumbnailPath Pfad zum PNG-Thumbnail
   */
  public async deleteThumbnail(thumbnailPath: string): Promise<void> {
    try {
      await unlink(thumbnailPath);
      console.log(`Thumbnail gelöscht: ${thumbnailPath}`);
    } catch (err: any) {
      console.error(`Fehler beim Löschen des Thumbnails ${thumbnailPath}:`, err);
    }
  }
}

export const thumbnailService = new ThumbnailService('thumbnails', 'files');