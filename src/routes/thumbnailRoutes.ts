import { Router } from "express"
import { generateThumbnails } from "../controllers/thumbnailController.js"

const router = Router()

router.get("/files", generateThumbnails)

export default router
