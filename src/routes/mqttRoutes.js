import { Router } from 'express';
import { printFile3mf, getAccessCode, movePrintHead, movePrintHeadHome } from '../controllers/mqttController.js';

const router = Router();

router.get('/print-file', printFile3mf);

router.get('/access-code', getAccessCode);

router.get('/move-print-head', movePrintHead);

router.get('/move-print-head-home', movePrintHeadHome);
export default router;
