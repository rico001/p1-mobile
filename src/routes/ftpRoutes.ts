
import { Router, Request } from 'express';
import multer, { StorageEngine, FileFilterCallback } from 'multer';
import {
  uploadFile,
  downloadFile,
  deleteFile,
  listFiles,
  renameFile
} from '../controllers/ftpController';

const router = Router();

// init multer and set storage
const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'files/'),
  filename: (_req, file, cb) => cb(null, file.originalname)
});

// fileFilter: nur .3mf-Dateien zulassen
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.originalname.toLowerCase().endsWith('.3mf')) {
    cb(null, true);
  } else {
    cb(new Error('Nur .3mf-Dateien sind erlaubt!'));
  }
};

const upload = multer({ storage, fileFilter });

// GET-Routen
router.get('/list-files', listFiles);
router.get('/delete-file', deleteFile);
router.get('/download-file', downloadFile);
router.get('/rename-file', renameFile);

// POST-Route für Datei-Upload (.3mf)
router.post(
  '/upload-file',           // Route: /api/ftp/upload-file
  upload.single('file'),    // Middleware: erwartet Feld 'file'
  uploadFile                // Controller-Funktion
);

export default router;