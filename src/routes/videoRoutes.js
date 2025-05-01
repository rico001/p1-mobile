import { Router } from 'express';
import { videoStream } from '../controllers/videoController';

const router = Router();

router.get('/video-stream', videoStream);

export default router;
