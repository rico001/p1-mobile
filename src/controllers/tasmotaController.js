// controllers/tasmotaController.js
import TasmotaService from '../services/tasmotaService.js';

export async function getTasmotaSwitch(req, res) {
  try {
    const state = await TasmotaService.getStatus();
    if (state === null) {
      return res.status(502).json({ error: 'Tasmota-Status konnte nicht abgerufen werden', switch: null });
    }
    res.json({ switch: state });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
}

export async function toggleTasmotaSwitch(req, res) {
  try {
    const state = await TasmotaService.toggle();
    res.json({ switch: state });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
}

export async function turnOnTasmotaSwitch(req, res) {
  try {
    const state = await TasmotaService.turnOn();
    res.json({ switch: state });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
}

export async function turnOffTasmotaSwitch(req, res) {
  try {
    const state = await TasmotaService.turnOff();
    res.json({ switch: state });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
}
