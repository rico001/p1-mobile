// services/TasmotaService.js
import { config } from '../config/index.js';
// kein node-fetch mehr importieren!

class TasmotaService {
  constructor(tasmotaConfig = config.tasmota) {
    this.ip = tasmotaConfig.ip;
  }

  async getStatus() {
    const url = `http://${this.ip}/cm?cmnd=Power%20Status`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen des Status');
    }
    const data = await response.json();
    return data.POWER1 === 'ON'
  }

  async toggle() {
    const url = `http://${this.ip}/cm?cmnd=Power%20Toggle`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Fehler beim Umschalten');
    }
    const data = await response.json();
    return data.POWER === 'ON';
  }

  async turnOn() {
    const url = `http://${this.ip}/cm?cmnd=Power%20On`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Fehler beim Einschalten');
    }
    const data = await response.json();
    return (data.POWER === 'ON') || (data.StatusSTS?.POWER === 'ON');
  }

  async turnOff() {
    const url = `http://${this.ip}/cm?cmnd=Power%20Off`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Fehler beim Ausschalten');
    }
    const data = await response.json();
    return (data.POWER === 'OFF') || (data.StatusSTS?.POWER === 'OFF');
  }
}

export default new TasmotaService();
