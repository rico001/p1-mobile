// ftpRoutes.js
import { Router } from "express"
import multer from "multer"
import { uploadFile, downloadFile, deleteFile, listFiles } from "../controllers/ftpController.js"

// init multer and set storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'files/'),
    filename: (req, file, cb) => cb(null, file.originalname)
});
// fileFilter: nur .3mf-Dateien zulassen
const fileFilter = (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith('.3mf')) {
        cb(null, true); // akzeptieren
    } else {
        cb(new Error('Nur .3mf-Dateien sind erlaubt!'), false); // ablehnen
    }
};

const upload = multer({ storage, fileFilter });
const router = Router()

// GET Routen
router.get("/list-files", listFiles)
router.get("/delete-file", deleteFile)
router.get("/download-file", downloadFile)

// POST Routen
router.post(
    '/upload-file', // Route: /api/ftp/upload-file
    upload.single('file'),   // Middleware: ein einzelnes Feld 'file'
    uploadFile               // Dein Controller
);


export default router
