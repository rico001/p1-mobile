// ftpService.js
import ftp from 'basic-ftp'
import { config } from '../config/index.js';

const rootPath = '/'

class FTPService {

    constructor(ftpConfig = config.ftp) {
        this.config = ftpConfig
        this.client = new ftp.Client()
    }

    async connect() {
        if (!this.client.closed) {
            return // schon verbunden
        }
        console.log('[FTP] zu:', this.config)
        await this.client.access({
            host: this.config.host,
            port: this.config.port || 990,
            user: this.config.user,
            password: this.config.password,
            secure: this.config.secure || "implicit",
            secureOptions: {
                rejectUnauthorized: false
            }
        })
        console.log('[FTP] ✅ Verbunden')
    }

    async close() {
        this.client.close()
        console.log('[FTP] ❌ Verbindung geschlossen')
    }

    async listFiles(remoteDir = rootPath) {
        try {
            await this.connect()
            return await this.client.list(remoteDir)
        } catch (error) {
            await this.close()
            throw new Error("Fehler beim Listen der Dateien: " + error.message)
        }
    }

    async fileExists(remotePath) {
        await this.connect()
        const files = await this.client.list(rootPath)
        const file = files.find(file => file.name === remotePath)
        if (file) {
            return true
        } else {
            return false
        }
    }

    async renameFile(oldPath, newPath) {
        try {
            
            await this.connect()
            console.log(`Datei umbenannt: ${oldPath} -> ${rootPath + newPath}`)
            await this.client.rename(rootPath + oldPath, rootPath + newPath)
            console.log(`Datei umbenannt: ${rootPath + oldPath} -> ${rootPath + newPath}`)
        }
        catch (error) {
            await this.close()
            throw new Error("Fehler beim Umbenennen der Datei: " + error.message)
        }
    }

    async uploadFile(localPath, remotePath) {
        try {
            await this.connect();
            await this.client.uploadFrom(localPath, remotePath);
            console.log(`Datei hochgeladen: ${localPath} -> ${remotePath}`);
        } catch (err) {
            throw new Error("Fehler beim FTP-Upload: " + err.message);
        } finally {
            this.client.close();
        }
    }

    async downloadFile(remotePath, localPath) {
        try {
            await this.connect()
            await this.client.downloadTo(localPath, remotePath)
            console.log(`Datei heruntergeladen: ${remotePath} -> ${localPath}`)
        } catch (error) {
            await this.close()
            throw new Error("Fehler beim Download: " + error.message)
        }
    }

    async deleteFile(remotePath) {
        try {
            await this.connect()
            await this.client.remove(remotePath)
            console.log(`Datei gelöscht: ${remotePath}`)
        } catch (error) {
            await this.close()
            throw new Error("Fehler beim Löschen der Datei: " + error.message)
        }
    }

}

export default new FTPService()
