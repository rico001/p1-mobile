// ftpRoutes.js
import { Router } from "express"
import { uploadFile, downloadFile, deleteFile, createFolder, moveFile, clearFolder, listFiles } from "../controllers/ftpController.js"

const router = Router()

// GET Routen
router.get("/list-files", listFiles)
router.get("/delete-file", deleteFile)
router.get("/download-file", downloadFile)
// POST Routen
router.post("/upload", uploadFile)

export default router
