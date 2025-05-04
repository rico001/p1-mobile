import { Router } from 'express';
import {
  getTasmotaSwitch,
  toggleTasmotaSwitch,
  turnOnTasmotaSwitch,
  turnOffTasmotaSwitch,
} from '../controllers/tasmotaController.js';

const router = Router();

// alle Routen als GET
router.get('/status', getTasmotaSwitch);
router.get('/toggle', toggleTasmotaSwitch);
router.get('/turn-on', turnOnTasmotaSwitch);
router.get('/turn-off', turnOffTasmotaSwitch);

export default router;
