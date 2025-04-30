// ftpController.js
import ftpService from "../services/ftpService.js"
import path from 'path';
import * as fs from "fs";
import ThumbnailService from "../services/thumbnailService.js";

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
                download: {
                    method: "GET",
                    path: path.posix.join('/api/ftp/download-file?fileName=' + file.name)
                },
                delete: {
                    method: "GET",
                    path: path.posix.join('/api/ftp/delete-file?fileName=' + file.name)
                },
                refreshThumbnail: {
                    method: "GET",
                    path: path.posix.join('/api/thumbnail/files?fileName=' + file.name)
                },
                print: {
                    method: "GET",
                    path: path.posix.join('/api/mqtt/print-file?fileName=' + file.name)
                }
            }
        }))

        res.json(filteredFiles)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const uploadFile = async (req, res) => {
    try {
        // 2. Prüfen, ob Multer eine Datei liefert
        if (!req.file) {
            return res.status(400).json({ message: "Keine Datei im Feld 'file' gefunden." });
        }

        // 3. Pfade setzen
        const filelocalPath = path.resolve(process.cwd(), "files", req.file.originalname); // z. B. '/tmp/meinedatei.txt'
        const remotePath = path.posix.join("/", req.file.originalname); // z. B. '/meinedatei.txt'
        await ftpService.uploadFile(filelocalPath, remotePath);

        const thumbnailPath = path.resolve(process.cwd(), "thumbnails", req.file.originalname + ".png");
        await ThumbnailService.extractThumbnail(filelocalPath, thumbnailPath);

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
        const thumbnailPath = path.resolve(process.cwd(), "thumbnails", fileName + ".png")
        ThumbnailService.deleteThumbnail(thumbnailPath)

        res.json({ message: "success", command: "deleteFile", fileName: fileName })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
