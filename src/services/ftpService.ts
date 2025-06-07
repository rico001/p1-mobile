import { Client, AccessOptions, FileInfo } from 'basic-ftp';
import { config, FTPConfig } from '../config';

const rootPath = '/';

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
}

export default new FTPService(config.ftp);
