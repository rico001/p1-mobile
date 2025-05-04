import { Router } from 'express';
import { videoStream1, videoStream2 } from '../controllers/videoController.js';

const router = Router();

// GET http://localhost:3000/video-stream
router.get('/video-stream-1', videoStream1);
router.get('/video-stream-2', videoStream2);

export default router;
