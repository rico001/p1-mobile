// ftpService.js
import ftp from 'basic-ftp'
import { config } from '../config/index.js';

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

    async listFiles(remoteDir = "/") {
        try {
            await this.connect()
            return await this.client.list(remoteDir)
        } catch (error) {
            throw new Error("Fehler beim Listen der Dateien: " + error.message)
        }
    }

    async uploadFile(localPath, remotePath) {
        try {
            await this.connect()
            await this.client.uploadFrom(localPath, remotePath)
            console.log(`Datei hochgeladen: ${localPath} -> ${remotePath}`)
        } catch (error) {
            throw new Error("Fehler beim Upload: " + error.message)
        }
    }

    async downloadFile(remotePath, localPath) {
        try {
            await this.connect()
            await this.client.downloadTo(localPath, remotePath)
            console.log(`Datei heruntergeladen: ${remotePath} -> ${localPath}`)
        } catch (error) {
            throw new Error("Fehler beim Download: " + error.message)
        }
    }

    async deleteFile(remotePath) {
        try {
            await this.connect()
            await this.client.remove(remotePath)
            console.log(`Datei gelöscht: ${remotePath}`)
        } catch (error) {
            throw new Error("Fehler beim Löschen der Datei: " + error.message)
        }
    }

    async createFolder(remotePath) {
        try {
            await this.connect()
            await this.client.ensureDir(remotePath)
            console.log(`Ordner erstellt (oder bereits vorhanden): ${remotePath}`)
        } catch (error) {
            throw new Error("Fehler beim Erstellen des Ordners: " + error.message)
        }
    }

    async moveFile(oldPath, newPath) {
        try {
            await this.connect()
            await this.client.rename(oldPath, newPath)
            console.log(`Datei verschoben/umbenannt: ${oldPath} -> ${newPath}`)
        } catch (error) {
            throw new Error("Fehler beim Verschieben der Datei: " + error.message)
        }
    }

    async clearFolder(remoteDir) {
        try {
            await this.connect()
            const files = await this.client.list(remoteDir)
            for (const file of files) {
                const filePath = `${remoteDir}/${file.name}`
                if (file.isDirectory) {
                    await this.clearFolder(filePath)
                    await this.client.removeDir(filePath)
                    console.log(`Ordner gelöscht: ${filePath}`)
                } else {
                    await this.client.remove(filePath)
                    console.log(`Datei gelöscht: ${filePath}`)
                }
            }
        } catch (error) {
            throw new Error("Fehler beim Leeren des Ordners: " + error.message)
        }
    }
}

export default new FTPService()
