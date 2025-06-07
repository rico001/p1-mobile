import { Router } from 'express';
import { videoStream, videoStreamExtern1, videoStreamExtern2 } from '../controllers/videoController.js';

const router = Router();

router.get('/video-stream', videoStream);

router.get('/video-stream-extern-1', videoStreamExtern1);

router.get('/video-stream-extern-2', videoStreamExtern2);

export default router;
