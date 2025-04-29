// ftpController.js
import ftpService from "../services/ftpService.js"
import path from 'path';
import * as fs from "fs";
import PuppeteerService from "../services/puppeteerService.js";

//GET /api/ftp/list-files
export const listFiles = async (req, res) => {
    //create list of all thumbnails in thumbnails folder
    const thumbnailsDir = path.resolve(process.cwd(), 'thumbnails');
    const thumbnailFiles = await fs.promises.readdir(thumbnailsDir);
    try {

        const fileType = req.query.type || "3mf"
        const files = await ftpService.listFiles("/")

        let filteredFiles = files

        if (fileType) {
            // Filter anwenden
            filteredFiles = files.filter(file =>
                file.name.toLowerCase().endsWith(`.${fileType.toLowerCase()}`)
            )
        }

        filteredFiles = filteredFiles.map(file => ({
            name: file.name,
            size: file.size,
            thumbnail: thumbnailFiles.find(thumbnail => thumbnail.startsWith(file.name)) ?
                path.posix.join('/thumbnails', thumbnailFiles.find(thumbnail => thumbnail.startsWith(file.name))) :
                null,
            operations: {
                download: path.posix.join('/api/ftp/download-file?fileName=' + file.name),
                delete: path.posix.join('/api/ftp/delete-file?fileName=' + file.name),
                refreshThumbnail: path.posix.join('/api/thumbnail/files?fileName=' + file.name),
                print: path.posix.join('/api/mqtt/print-file?fileName=' + file.name)
            }
        }))

        res.json(filteredFiles)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

/*



  async uploadFile(localPath, remotePath) {
        try {
            await this.connect()
            await this.client.uploadFrom(localPath, remotePath)
            console.log(`Datei hochgeladen: ${localPath} -> ${remotePath}`)
        } catch (error) {
            throw new Error("Fehler beim Upload: " + error.message)
        }
    }
*/

export const uploadFile = async (req, res) => {
    try {
        // 2. Prüfen, ob Multer eine Datei liefert
        if (!req.file) {
            return res.status(400).json({ message: "Keine Datei im Feld 'file' gefunden." });
        }

        // 3. Pfade setzen
        const localPath = path.resolve(process.cwd(), "files", req.file.originalname); // z. B. '/tmp/meinedatei.txt'
        const remotePath = path.posix.join("/", req.file.originalname); // z. B. '/meinedatei.txt'

        // 4. Upload über deinen FTP-Service
        await ftpService.uploadFile(localPath, remotePath);


        const thumbDir = path.resolve(process.cwd(), 'thumbnails');
        const thumbnailFileName = `${req.file.originalname}.png`;
        const thumbnailPath = path.resolve(thumbDir, thumbnailFileName);
        let buffer;
        try {
            buffer = await PuppeteerService.extractThumbnailFrom3mf(localPath);
            if (!buffer) {
                //throw new Error('Thumbnail konnte nicht extrahiert werden');
            } else {
                await fs.promises.writeFile(thumbnailPath, buffer);
            }
        } catch (error) {
            console.error(`Fehler beim Generieren des Thumbnails für ${thumbnailFileName}`, error);
        }

        // 5. Optional: lokale Datei löschen
        fs.unlink(localPath, err => {
            if (err) console.warn('Löschen der lokalen Datei fehlgeschlagen:', err);
        });

        res.json({ message: "Datei erfolgreich hochgeladen." });
    } catch (error) {
        console.error('Upload-Fehler:', error);
        res.status(500).json({ message: error.message });
    }
};


export const downloadFile = async (req, res) => {
    try {
        const fileName = req.query.fileName;
        if (!fileName) {
            return res
                .status(400)
                .json({ message: "fileName ist erforderlich." });
        }

        // 1. Lokales Temp-Verzeichnis unter process.cwd()/tmp
        const localDir = path.resolve(process.cwd(), "files");
        if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
        }
        const localPath = path.join(localDir, fileName);

        // 2. Datei vom FTP-Server herunterladen
        await ftpService.downloadFile(
            path.posix.join("/", fileName), // Remote-Pfad
            localPath // Lokaler Pfad
        );

        // 3. Datei an den Client senden
        res.download(localPath, fileName, (err) => {
            if (err) {
                console.error("Fehler beim Senden der Datei:", err);
                if (!res.headersSent) {
                    return res
                        .status(500)
                        .json({ message: "Fehler beim Senden der Datei." });
                }
            } else {
                // Temp-Datei aufräumen
                fs.unlink(localPath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.warn("Konnte temporäre Datei nicht löschen:", unlinkErr);
                    }
                });
            }
        });
    } catch (error) {
        console.error("Download-Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteFile = async (req, res) => {
    try {
        const fileName = req.query.fileName
        if (!fileName) {
            return res.status(400).json({ message: "remotePath ist erforderlich." })
        }
        await ftpService.deleteFile(fileName)
        res.json({ message: "success", command: "deleteFile", fileName: fileName })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
