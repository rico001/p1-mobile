// ftpController.js
import ftpService from "../services/ftpService.js"
import path from 'path';
import fs from 'fs/promises';
import PuppeteerService from "../services/puppeteerService.js";

export const generateThumbnails = async (req, res) => {
    try {
        const fileName = req.query.fileName; // dieser muss noch implementiert werden
        const remoteDir = req.query.path || '/';
        const fileType = req.query.type || '3mf';
        const files = await ftpService.listFiles(remoteDir);
        let targets = files.filter(f =>
            f.name.toLowerCase().endsWith(`.${fileType.toLowerCase()}`)
        );

        // Erstelle lokale Temp- und Thumbnails-Ordner
        const tmpDir = path.resolve(process.cwd(), 'files');
        const thumbDir = path.resolve(process.cwd(), 'thumbnails');
        await fs.mkdir(tmpDir, { recursive: true });
        await fs.mkdir(thumbDir, { recursive: true });

        const results = [];
        //filter by filename
        if (fileName) {
            targets = targets.filter(file => file.name.toLowerCase() === fileName.toLowerCase());
        }
        for (const file of targets) {
            const local3mf = path.resolve(tmpDir, file.name);
            const thumbnailFileName = `${file.name}.png`;
            const thumbnailPath = path.resolve(thumbDir, thumbnailFileName);

            // 1. Lade Datei vom FTP-Server
            console.log(`Lade ${file.name} herunter...`);
            await ftpService.downloadFile(
                path.posix.join(remoteDir, file.name),
                local3mf
            );
            console.log(`Lade ${file.name} herunter... Fertig!`);

            // 2. Generiere Thumbnail via PuppeteerService synchron
            let buffer;
            try {
                buffer = await PuppeteerService.extractThumbnailFrom3mf(local3mf);
                if (!buffer) {
                    throw new Error('Thumbnail konnte nicht extrahiert werden');
                }
            } catch (error) {
                console.error(`Fehler beim Generieren des Thumbnails für ${file.name}:`, error);
                // Lösche lokale 3MF-Datei und fahre fort
                await fs.unlink(local3mf).catch(() => { });
                continue;
            }

            // 3. Speichere Thumbnail lokal
            await fs.writeFile(thumbnailPath, buffer);

            // 5. Lösche lokale 3MF-Datei
            await fs.unlink(local3mf);

            results.push({ message: "success", 
                command: "generateThumbnails", 
                fileName: fileName, 
                refreshedThumbnail: "/thumbnails/" + thumbnailFileName 
            });
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};