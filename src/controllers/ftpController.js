// ftpController.js
import ftpService from "../services/ftpService.js"
import path from 'path';
import fs from 'fs/promises';
import PuppeteerService from "../services/puppeteerService.js";

//GET /api/ftp/list?path=/ordner&type=3mf
export const listFiles = async (req, res) => {
    //create list of all thumbnails in thumbnails folder
    const thumbnailsDir = path.resolve(process.cwd(), 'thumbnails');
    const thumbnailFiles = await fs.readdir(thumbnailsDir);
    try {
        const remoteDir = req.query.path || "/"
        const fileType = req.query.type || null // Typ aus Query holen (z.B. "pdf" oder "jpg")

        const files = await ftpService.listFiles(remoteDir)


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
                path.posix.join('/thumbnails', thumbnailFiles.find(thumbnail => thumbnail.startsWith(file.name))) : null,
        }))

        res.json(filteredFiles)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const generateThumbnails = async (req, res) => {
    try {
        const remoteDir = req.query.path || '/';
        const fileType = req.query.type || '3mf';
        const files = await ftpService.listFiles(remoteDir);
        const targets = files.filter(f =>
            f.name.toLowerCase().endsWith(`.${fileType.toLowerCase()}`)
        );

        // Erstelle lokale Temp- und Thumbnails-Ordner
        const tmpDir = path.resolve(process.cwd(), 'tmp');
        const thumbDir = path.resolve(process.cwd(), 'thumbnails');
        await fs.mkdir(tmpDir, { recursive: true });
        await fs.mkdir(thumbDir, { recursive: true });

        const results = [];
        for (const file of targets) {
            const local3mf = path.resolve(tmpDir, file.name);
            const thumbnailFileName = `${file.name}__thumbnail.png`;
            const thumbnailPath = path.resolve(thumbDir, thumbnailFileName);

            // 1. Lade Datei vom FTP-Server
            await ftpService.downloadFile(
                path.posix.join(remoteDir, file.name),
                local3mf
            );

            // 2. Generiere Thumbnail via PuppeteerService synchron
            let buffer;
            try {
                buffer = await PuppeteerService.screenshot3mf(
                    local3mf,
                    { width: 800, height: 600, fullPage: false }
                );
            } catch (error) {
                console.error(`Fehler beim Generieren des Thumbnails für ${file.name}:`, error);
                // Lösche lokale 3MF-Datei und fahre fort
                await fs.unlink(local3mf).catch(() => { });
                continue;
            }

            // 3. Speichere Thumbnail lokal
            await fs.writeFile(thumbnailPath, buffer);

            // 4. Optional: Lade Thumbnail zurück auf FTP (uncomment, falls benötigt)
            // await ftpService.uploadFile(
            //   thumbnailPath,
            //   path.posix.join(remoteDir, 'thumbnails', thumbnailFileName)
            // );

            // 5. Lösche lokale 3MF-Datei
            await fs.unlink(local3mf);

            results.push({ file: file.name, thumbnail: thumbnailPath });
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const uploadFile = async (req, res) => {
    try {
        const { localPath, remotePath } = req.body
        if (!localPath || !remotePath) {
            return res.status(400).json({ message: "localPath und remotePath sind erforderlich." })
        }
        await ftpService.uploadFile(localPath, remotePath)
        res.json({ message: "Datei erfolgreich hochgeladen." })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


export const downloadFile = async (req, res) => {
    try {
        const { remotePath, localPath } = req.body
        if (!remotePath || !localPath) {
            return res.status(400).json({ message: "remotePath und localPath sind erforderlich." })
        }
        await ftpService.downloadFile(remotePath, localPath)
        res.json({ message: "Datei erfolgreich heruntergeladen." })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const deleteFile = async (req, res) => {
    try {
        const { remotePath } = req.body
        if (!remotePath) {
            return res.status(400).json({ message: "remotePath ist erforderlich." })
        }
        await ftpService.deleteFile(remotePath)
        res.json({ message: "Datei erfolgreich gelöscht." })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const createFolder = async (req, res) => {
    try {
        const { remotePath } = req.body
        if (!remotePath) {
            return res.status(400).json({ message: "remotePath ist erforderlich." })
        }
        await ftpService.createFolder(remotePath)
        res.json({ message: "Ordner erfolgreich erstellt." })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const moveFile = async (req, res) => {
    try {
        const { oldPath, newPath } = req.body
        if (!oldPath || !newPath) {
            return res.status(400).json({ message: "oldPath und newPath sind erforderlich." })
        }
        await ftpService.moveFile(oldPath, newPath)
        res.json({ message: "Datei erfolgreich verschoben/umbenannt." })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const clearFolder = async (req, res) => {
    try {
        const { remoteDir } = req.body
        if (!remoteDir) {
            return res.status(400).json({ message: "remoteDir ist erforderlich." })
        }
        await ftpService.clearFolder(remoteDir)
        res.json({ message: "Ordnerinhalt erfolgreich gelöscht." })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
