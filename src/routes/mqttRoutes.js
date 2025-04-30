import { Router } from 'express';
import { printFile3mf, getAccessCode, movePrintHead, movePrintHeadHome, setLight } from '../controllers/mqttController.js';

const router = Router();

router.get('/print-file', printFile3mf);

router.get('/access-code', getAccessCode);

router.get('/move-print-head', movePrintHead);

router.get('/move-print-head-home', movePrintHeadHome);

router.get('/set-light', setLight);
export default router;
