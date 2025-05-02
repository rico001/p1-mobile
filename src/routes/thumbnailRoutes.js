// ftpRoutes.js
import { Router } from "express"
import { generateThumbnails } from "../controllers/thumbnailController.js"

const router = Router()

// GET Routen
//http://localhost:3000/api/thumbnail/files?fileName=3mf-test.3mf
//http://localhost:3000/api/thumbnail/files
router.get("/files", generateThumbnails)

export default router
