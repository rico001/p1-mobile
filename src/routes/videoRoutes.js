import { Router } from 'express';
import { videoStream } from '../controllers/videoController.js';

const router = Router();

// GET http://localhost:3000/video-stream
router.get('/video-stream', videoStream);

export default router;
