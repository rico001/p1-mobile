import { Router } from 'express';
import { 
    printFile3mf, 
    getAccessCode, 
    movePrintHead, 
    movePrintHeadHome, 
    setLight, 
    getState, 
    stopPrint, 
    pausePrint, 
    resumePrint 
} from '../controllers/mqttController.js';

const router = Router();

router.get('/print-file', printFile3mf);

router.get('/access-code', getAccessCode);

router.get('/move-print-head', movePrintHead);

router.get('/move-print-head-home', movePrintHeadHome);

router.get('/state', getState);

router.get('/set-light', setLight);

router.get('/print/stop', stopPrint);

router.get('/print/pause', pausePrint);

router.get('/print/resume', resumePrint);

export default router;
