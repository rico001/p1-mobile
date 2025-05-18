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
    resumePrint,
    setPrintSpeed,
    unloadAms,
    setAmsTray
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

router.get('/print/set-speed', setPrintSpeed);

router.get('/print/ams/unload', unloadAms);

router.get('/print/ams/tray/set', setAmsTray);

export default router;
