import { Client, AccessOptions, FileInfo } from 'basic-ftp';
import { config, FTPConfig } from '../config';
import path from 'path';

const rootPath = '/p1-app-models';

class FTPService {
  private config: FTPConfig;
  private client: Client;

  constructor(ftpConfig: FTPConfig) {
    this.config = ftpConfig;
    this.client = new Client();
  }

  /**
   * Stellt eine Verbindung zum FTP-Server her (wenn nicht bereits verbunden).
   */
  async connect(): Promise<void> {
    if (!this.client.closed) {
      return; // Schon verbunden
    }

    console.log('[FTP] zu:', this.config);

    const accessOptions: AccessOptions = {
      host: this.config.host,
      port: this.config.port ?? 990,
      user: this.config.user,
      password: this.config.password,
      secure: this.config.secure || "implicit",
      secureOptions: {
        rejectUnauthorized: false
      }
    };

    await this.client.access(accessOptions);
    console.log('[FTP] ✅ Verbunden');
  }

  /**
   * Schließt die Verbindung.
   */
  close(): void {
    this.client.close();
    console.log('[FTP] ❌ Verbindung geschlossen');
  }

  /**
   * Listet Dateien im gegebenen Verzeichnis auf.
   */
  async listFiles(remoteDir: string = rootPath): Promise<FileInfo[]> {
    try {
      await this.connect();
      return await this.client.list(remoteDir);
    } catch (err: any) {
      this.close();
      throw new Error('Fehler beim Listen der Dateien: ' + err.message);
    }
  }

  /**
   * Prüft, ob eine Datei existiert (im rootPath).
   */
  async fileExists(remotePath: string): Promise<boolean> {
    await this.connect();
    const files = await this.client.list(rootPath);
    return files.some(file => file.name === remotePath);
  }

  /**
   * Bennent eine Datei um.
   */
  async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      await this.connect();
      console.log(`Datei umbenannt: ${oldPath} -> ${rootPath + newPath}`);
      await this.client.rename(rootPath + oldPath, rootPath + newPath);
    } catch (err: any) {
      this.close();
      throw new Error('Fehler beim Umbenennen der Datei: ' + err.message);
    }
  }

  /**
   * Lädt eine lokale Datei auf den FTP-Server hoch.
   */
  async uploadFile(localPath: string, remotePath: string): Promise<void> {
    try {
      await this.connect();
      await this.client.uploadFrom(localPath, remotePath);
      console.log(`Datei hochgeladen: ${localPath} -> ${remotePath}`);
    } catch (err: any) {
      throw new Error('Fehler beim FTP-Upload: ' + err.message);
    } finally {
      this.client.close();
    }
  }

  /**
   * Lädt eine Datei vom FTP-Server herunter.
   */
  async downloadFile(remotePath: string, localPath: string): Promise<void> {
    try {
      await this.connect();
      await this.client.downloadTo(localPath, remotePath);
      console.log(`Datei heruntergeladen: ${remotePath} -> ${localPath}`);
    } catch (err: any) {
      this.close();
      throw new Error('Fehler beim Download: ' + err.message);
    }
  }

  /**
   * Löscht eine Datei auf dem FTP-Server.
   */
  async deleteFile(remotePath: string): Promise<void> {
    try {
      await this.connect();
      await this.client.remove(remotePath);
      console.log(`Datei gelöscht: ${remotePath}`);
    } catch (err: any) {
      this.close();
      throw new Error('Fehler beim Löschen der Datei: ' + err.message);
    }
  }

  /**
   * Listet Dateien UND Ordner im gegebenen Verzeichnis auf.
   */
  async listFilesAndFolders(remoteDir: string = rootPath): Promise<FileInfo[]> {
    try {
      await this.connect();
      return await this.client.list(remoteDir);
    } catch (err: any) {
      this.close();
      throw new Error('Fehler beim Listen der Dateien und Ordner: ' + err.message);
    }
  }

  /**
   * Erstellt ein neues Verzeichnis auf dem FTP-Server.
   */
  async createFolder(remotePath: string): Promise<void> {
    try {
      await this.connect();
      await this.client.ensureDir(remotePath);
      console.log(`Ordner erstellt: ${remotePath}`);
    } catch (err: any) {
      this.close();
      throw new Error('Fehler beim Erstellen des Ordners: ' + err.message);
    }
  }

  /**
   * Löscht ein Verzeichnis (rekursiv).
   */
  async deleteFolder(remotePath: string): Promise<void> {
    try {
      await this.connect();
      await this.deleteFolderRecursive(remotePath);
      console.log(`[FTP] Ordner gelöscht: ${remotePath}`);
    } catch (err: any) {
      this.close();
      throw new Error(err.message);
    }
  }

  /**
   * Hilfsmethode für rekursives Löschen.
   */
  private async deleteFolderRecursive(remotePath: string): Promise<void> {
    let files: FileInfo[] = [];

    // Liste Inhalte des Ordners
    try {
      files = await this.client.list(remotePath);
    } catch (err) {
      // Wenn Listing fehlschlägt, versuche trotzdem zu löschen (könnte leer sein)
      console.log(`[FTP] Konnte Ordner nicht listen: ${remotePath}, versuche zu löschen...`);
    }

    // Lösche alle Dateien und Unterordner
    for (const file of files) {
      const filePath = path.posix.join(remotePath, file.name);

      if (file.isDirectory) {
        // Rekursiv Unterordner löschen
        await this.deleteFolderRecursive(filePath);
      } else {
        // Datei löschen
        await this.client.remove(filePath);
        console.log(`[FTP]   Datei gelöscht: ${filePath}`);
      }
    }

    // Lösche das leere Verzeichnis mit direktem RMD-Befehl
    try {
      await this.client.send('RMD ' + remotePath);
      console.log(`[FTP]   Verzeichnis gelöscht: ${remotePath}`);
    } catch (err: any) {
      // Fallback: versuche removeDir
      try {
        await this.client.removeDir(remotePath);
      } catch (err2) {
        console.error(`[FTP] Fehler beim Löschen von ${remotePath}:`, err2);
        throw err;
      }
    }
  }

  /**
   * Verschiebt eine Datei/Ordner.
   */
  async moveFile(oldPath: string, newPath: string): Promise<void> {
    try {
      await this.connect();
      await this.client.rename(oldPath, newPath);
      console.log(`Verschoben: ${oldPath} -> ${newPath}`);
    } catch (err: any) {
      this.close();
      throw new Error('Fehler beim Verschieben: ' + err.message);
    }
  }

  /**
   * Initialisiert die benötigten Verzeichnisse beim Server-Start.
   * Erstellt /p1-app-models, /timelapse und /timelapse/thumbnail falls sie nicht existieren.
   */
  async ensureRootFolder(): Promise<void> {
    try {
      await this.connect();

      // Models-Verzeichnis
      await this.client.ensureDir(rootPath);
      console.log(`[FTP] ✅ Root-Verzeichnis sichergestellt: ${rootPath}`);

      // Timelapse-Verzeichnis
      await this.client.ensureDir('/timelapse');
      console.log(`[FTP] ✅ Timelapse-Verzeichnis sichergestellt: /timelapse`);

      // Timelapse-Thumbnail-Verzeichnis
      await this.client.ensureDir('/timelapse/thumbnail');
      console.log(`[FTP] ✅ Timelapse-Thumbnail-Verzeichnis sichergestellt: /timelapse/thumbnail`);

      this.close();
    } catch (err: any) {
      this.close();
      console.error(`[FTP] ❌ Fehler beim Sicherstellen der Verzeichnisse: ${err.message}`);
    }
  }
}

export default new FTPService(config.ftp);
