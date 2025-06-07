import { Request, Response } from 'express';
import { tasmotaService } from '../services/tasmotaService';


/**
 * Liefert den aktuellen Schaltzustand der Tasmota-Geräte.
 */
export async function getTasmotaSwitch(req: Request, res: Response): Promise<void> {
  try {
    const state: boolean | null = await tasmotaService.getStatus();
    if (state === null) {
      res.status(502).json({ error: 'Tasmota-Status konnte nicht abgerufen werden', switch: null });
      return;
    }
    res.json({ switch: state });
  } catch (err: any) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
}

/**
 * Schaltet den Zustand der Tasmota-Geräte um.
 */
export async function toggleTasmotaSwitch(req: Request, res: Response): Promise<void> {
  try {
    const state: boolean = await tasmotaService.toggle();
    res.json({ switch: state });
  } catch (err: any) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
}

/**
 * Schaltet die Tasmota-Geräte ein.
 */
export async function turnOnTasmotaSwitch(req: Request, res: Response): Promise<void> {
  try {
    const state: boolean = await tasmotaService.turnOn();
    res.json({ switch: state });
  } catch (err: any) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
}

/**
 * Schaltet die Tasmota-Geräte aus.
 */
export async function turnOffTasmotaSwitch(req: Request, res: Response): Promise<void> {
  try {
    const state: boolean = await tasmotaService.turnOff();
    res.json({ switch: state });
  } catch (err: any) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
}
