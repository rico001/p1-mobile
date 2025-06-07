import { config, TasmotaConfig } from '../config/index';

export default class TasmotaService {
  private ip: string | undefined;

  constructor(tasmotaConfig: TasmotaConfig) {
    this.ip = tasmotaConfig.ip
  }

  /**
   * Liest den aktuellen Power-Status von der Tasmota-Device.
   * @returns `true` wenn eingeschaltet, `false` wenn ausgeschaltet, `null` bei Fehler.
   */
  public async getStatus(): Promise<boolean | null> {
    const url = `http://${this.ip}/cm?cmnd=Power%20Status`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const data = await response.json() as Record<string, any>;
    return data.POWER1 === 'ON';
  }

  /**
   * Schaltet den Zustand um (Toggle).
   * @returns `true` wenn nach dem Toggle eingeschaltet, sonst `false`.
   * @throws Error bei HTTP-Fehler.
   */
  public async toggle(): Promise<boolean> {
    const url = `http://${this.ip}/cm?cmnd=Power%20Toggle`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Fehler beim Umschalten');
    }
    const data = await response.json() as Record<string, any>;
    return data.POWER === 'ON';
  }

  /**
   * Schaltet das Gerät ein.
   * @returns `true` wenn das Gerät eingeschaltet ist, sonst `false`.
   * @throws Error bei HTTP-Fehler.
   */
  public async turnOn(): Promise<boolean> {
    const url = `http://${this.ip}/cm?cmnd=Power%20On`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Fehler beim Einschalten');
    }
    const data = await response.json() as Record<string, any>;
    return data.POWER === 'ON' || data.StatusSTS?.POWER === 'ON';
  }

  /**
   * Schaltet das Gerät aus.
   * @returns `true` wenn das Gerät ausgeschaltet ist, sonst `false`.
   * @throws Error bei HTTP-Fehler.
   */
  public async turnOff(): Promise<boolean> {
    const url = `http://${this.ip}/cm?cmnd=Power%20Off`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Fehler beim Ausschalten');
    }
    const data = await response.json() as Record<string, any>;
    return data.POWER === 'OFF' || data.StatusSTS?.POWER === 'OFF';
  }
}

// Singleton-Instanz exportieren
export const tasmotaService = new TasmotaService(config.tasmota);
