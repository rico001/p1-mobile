import fs from 'fs';
import mqtt, { MqttClient, IClientOptions, IClientPublishOptions } from 'mqtt';
import { EventEmitter } from 'events';
import { config, MQTTConfig } from '../config/index';
import { formatBambuErrorCode, generateClientId } from '../utils/functions';
import websocketService from './websocketService';
import { randomUUID } from 'crypto';
import code2desc from '../utils/code2desc';

export class MqttService extends EventEmitter {
  private client: MqttClient;
  private clientId: string;
  private config: MQTTConfig;
  private _responseCallbacks: Map<string, (payload: any) => void> = new Map();
  private state: Record<string, any> = {};
  private mqttProxyService?: { publish: (topic: string, payload: any) => void };

  // Keys for flat updates
  private flatKeys = [
    'print_type', 'wifi_signal',
    'nozzle_temper', 'nozzle_target_temper',
    'bed_temper', 'bed_target_temper',
    'mc_percent', 'mc_remaining_time',
    'layer_num', 'total_layer_num',
    'gcode_file', 'spd_lvl', 'print_error'
  ];

  // Custom deep-object handlers
  private deepObjectKeys: { [key: string]: ({ newVal, oldVal }: { newVal: any; oldVal: any }) => void } = {
    lights_report: ({ newVal, oldVal }) => {
      const firstLight = newVal[0];
      if (!firstLight) return;
      const prevFirst = (oldVal || [])[0] || {};
      if (firstLight.mode !== prevFirst.mode) {
        websocketService.broadcast({ type: `${firstLight.node}_mode_update`, payload: firstLight.mode });
      }
    },
    ams: ({ newVal, oldVal }) => {
      const newValStr = JSON.stringify(newVal?.ams);
      const oldValStr = JSON.stringify(oldVal?.ams || {});
      if (newValStr !== oldValStr) {
        websocketService.broadcast({ type: 'ams_update', payload: newVal });
      }
    }
  };

  /**
   * Erzeugt Instanz und initialisiert Verbindung
   */
  constructor(mqttConfig: MQTTConfig, mqttProxyService?: { publish: (topic: string, payload: any) => void }) {
    super();
    this.clientId = generateClientId();
    this.config = mqttConfig;
    if (mqttProxyService) {
      this.mqttProxyService = mqttProxyService;
    }

    // Zertifikat prüfen
    if (!fs.existsSync(this.config.caCertPath)) {
      throw new Error(`Zertifikat nicht gefunden: ${this.config.caCertPath}`);
    }
    const ca = fs.readFileSync(this.config.caCertPath);
    console.log('ca', ca.toString());

    const opts: IClientOptions = {
      clientId: this.clientId,
      username: this.config.username,
      password: this.config.password,
      clean: true,
      reconnectPeriod: 8000,
      keepalive: 15,
      rejectUnauthorized: false,
      ca
    };

    // Verbinden und Events registrieren
    this.client = mqtt.connect(this.config.brokerUrl, opts);
    this.registerEvents();

    // Initialen State Request senden
    const getStatePayload = {
      pushing: {
        sequence_id: 'init_state' + Date.now(),
        command: 'pushall',
        version: 1,
        push_target: 1
      }
    };
    this.publish(this.config.topics.request, getStatePayload);
  }

  /** Setze Proxy-Service für Publishes */
  public setMqttProxyService(proxy: { publish: (topic: string, payload: any) => void }): void {
    this.mqttProxyService = proxy;
  }

  /** Event-Handler registrieren */
  private registerEvents(): void {
    this.client.on('connect', this.onConnect.bind(this));
    this.client.on('message', this.onMessage.bind(this));
    this.client.on('error', this.onError.bind(this));
    this.client.on('offline', this.onOffline.bind(this));
    this.client.on('close', this.onClose.bind(this));
  }

  private tryReconnect(err: Error | null = null): void {
    setTimeout(() => {
      console.log('[MQTT] 🔄 try reconnect after error, time:' + Date.now().toLocaleString())
      this.client?.reconnect();
    }, 5000);
  }

  private onOffline(): void {
    console.warn('[MQTT] 📴 Client ist offline.');
    websocketService.broadcast({ type: 'wifi_signal_update', payload: 'offline' });
    this.tryReconnect(null);
  }

  private onClose(): void {
    console.warn('[MQTT] ⚠️ Verbindung geschlossen.');
    websocketService.broadcast({ type: 'wifi_signal_update', payload: 'offline' });
    this.tryReconnect(null);
  }

  private onError(err: Error): void {
    console.error('[MQTT] ❌ Verbindungsfehler');
    websocketService.broadcast({ type: 'wifi_signal_update', payload: 'offline' });
    this.tryReconnect(err);
  }

  private onConnect(): void {
    console.log('[MQTT] ✅ Verbunden');
    websocketService.broadcast({ type: 'wifi_signal_update', payload: 'online' });
    this.client.subscribe(this.config.topics.report, err => {
      if (err) console.error('[MQTT] ❌ Subscribe-Fehler:', err);
      else console.log(`📡 Subscribed to '${this.config.topics.report}'`);
    });
  }

  private onMessage(topic: string, message: Buffer): void {
    const json = JSON.parse(message.toString());
    if (this.mqttProxyService) {
      this.mqttProxyService.publish(topic, json);
    }
    console.log(`[MQTT] 📥 ${topic}:`, json);
    websocketService.broadcastLog({
      type: 'log_update',
      payload: { id: randomUUID(), timeStamp: new Date().toISOString(), message: json, type: 'mqtt message' }
    });

    const seqId = this.findSequenceId(json);

    // Antwort-Callback ausführen
    if (topic === this.config.topics.report && seqId && this._responseCallbacks.has(seqId) && json?.print?.command !== 'push_status') {
      const cb = this._responseCallbacks.get(seqId)!;
      this._responseCallbacks.delete(seqId);
      cb(json);
      return;
    }

    // Push-Status: State aktualisieren & broadcasten
    if (json?.print?.command === 'push_status') {
      const updatedFields = Object.fromEntries(Object.entries(json.print).filter(([_, v]) => v !== undefined));
      const prevState = { ...this.state };
      this.state = { ...prevState, ...updatedFields };
      this.broadcastUpdatedFields(updatedFields, prevState);
    }
  }

  /** Rekursiv nach sequence_id suchen */
  private findSequenceId(obj: any): string | undefined {
    if (!obj || typeof obj !== 'object') return;
    if ('sequence_id' in obj && typeof obj.sequence_id === 'string') return obj.sequence_id;
    for (const key of Object.keys(obj)) {
      const res = this.findSequenceId(obj[key]);
      if (res) return res;
    }
  }

  /** Aktualisierte Felder broadcasten */
  private broadcastUpdatedFields(updatedFields: Record<string, any>, prevState: Record<string, any>): void {
    for (const [key, newVal] of Object.entries(updatedFields)) {
      const oldVal = prevState[key];
      if (this.deepObjectKeys[key]) {
        this.deepObjectKeys[key]({ newVal, oldVal });
        continue;
      }
      if (this.flatKeys.includes(key) && newVal !== oldVal) {
        if (key === 'print_error') {
          const hexError = formatBambuErrorCode(newVal);
          const errorMessage = code2desc(hexError);
          const whitelist = this.config.errorWhitelist;
          if (whitelist?.includes(hexError)) {
            console.log(`Ignoring error ${hexError}`);
            continue;
          }
          websocketService.broadcast({ type: `${key}_update`, payload: { error_code: newVal, error_code_hex: hexError, error_message: errorMessage } });
        } else {
          websocketService.broadcast({ type: `${key}_update`, payload: newVal });
        }
        console.log(`new ${key}`, newVal);
      }
    }
  }

  /** Publiziert Nachricht (inkl. Proxy) */
  public publish(topic: string, payload: any, options: IClientPublishOptions = { qos: 0 }): void {
    if (this.mqttProxyService) this.mqttProxyService.publish(topic, payload);
    this.client.publish(topic, JSON.stringify(payload), options);
  }

  /** Aktuellen State zurückgeben */
  public async getLastStateReport(): Promise<Record<string, any>> {
    return this.state;
  }

  /** Request mit Callback und Timeout */
  public request(payload: any, seqId: string, timeout = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      this._responseCallbacks.set(seqId, resolve);
      try {
        this.publish(this.config.topics.request, payload, { qos: 1 });
      } catch (err) {
        this._responseCallbacks.delete(seqId);
        return reject(err);
      }
      setTimeout(() => {
        if (this._responseCallbacks.has(seqId)) {
          this._responseCallbacks.delete(seqId);
          reject(new Error(`Timeout: kein Report für ${seqId}`));
        }
      }, timeout);
    });
  }
}

// Export einer Instanz als default
export const mqttService = new MqttService(config.mqtt);

export default mqttService;
