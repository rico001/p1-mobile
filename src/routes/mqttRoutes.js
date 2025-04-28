import { Router } from 'express';
import { printFile3mf, getAccessCode } from '../controllers/mqttController.js';

const router = Router();
router.get('/print-file-3mf', printFile3mf);
router.get('/access-code', getAccessCode);
export default router;
