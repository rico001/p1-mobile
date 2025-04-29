// ftpRoutes.js
import { Router } from "express"
import { uploadFile, downloadFile, deleteFile, createFolder, moveFile, clearFolder, listFiles } from "../controllers/ftpController.js"

const router = Router()

// GET Routen
router.get("/list-files", listFiles)
// POST Routen
router.post("/upload", uploadFile)
router.post("/download", downloadFile)
router.post("/delete", deleteFile)
router.post("/create-folder", createFolder)
router.post("/move", moveFile)
router.post("/clear-folder", clearFolder)

export default router
