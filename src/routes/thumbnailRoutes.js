// ftpRoutes.js
import { Router } from "express"
import { generateThumbnails } from "../controllers/thumbnailGenerator.js"

const router = Router()

// GET Routen
//http://localhost:3000/api/thumbnails/generate
router.get("/generate", generateThumbnails)

export default router
