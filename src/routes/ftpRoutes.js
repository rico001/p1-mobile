// ftpRoutes.js
import { Router } from "express"
import multer from "multer"
import { uploadFile, downloadFile, deleteFile, listFiles } from "../controllers/ftpController.js"

// init multer and set storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'files/'),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });
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
