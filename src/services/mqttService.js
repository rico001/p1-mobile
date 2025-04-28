// mqttService.js
import fs from 'fs';
import mqtt from 'mqtt';
import EventEmitter from 'events';
import { config } from '../config/index.js';
import { generateClientId } from '../utils/clientIdGenerator.js';

class MqttService extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.clientId = generateClientId();
    this.topics = config.mqtt.topics;
    
    // Map von sequence_id → resolve-Funktion
    this._responseCallbacks = new Map();
  }

  init() {
    if (!fs.existsSync(config.mqtt.caCertPath)) {
      throw new Error(`Zertifikat nicht gefunden: ${config.mqtt.caCertPath}`);
    }
    const ca = fs.readFileSync(config.mqtt.caCertPath);
    const opts = {
      clientId: this.clientId,
      username: config.mqtt.username,
      password: config.mqtt.password,
      clean: true,
      reconnectPeriod: 1000,
      keepalive: 20,
      rejectUnauthorized: false,
      ca
    };
    this.client = mqtt.connect(config.mqtt.brokerUrl, opts);
    this._registerEvents();
  }

  _registerEvents() {
    this.client.on('connect', () => {
      console.log('[MQTT] ✅ Verbunden');
      this.client.subscribe(this.topics.report, err => {
        if (err) console.error('[MQTT] ❌ Subscribe-Fehler:', err);
        else console.log(`[MQTT] 📡 Subscribed to '${this.topics.report}'`);
      });
    });
    this.client.on('message', this._onMessage.bind(this));
  }

// Hilfsfunktion: sucht rekursiv nach sequence_id
findSequenceId(obj) {
  if (!obj || typeof obj !== 'object') return undefined;
  if ('sequence_id' in obj && typeof obj.sequence_id === 'string') {
    return obj.sequence_id;
  }
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const seq = this.findSequenceId(val);
    if (seq) return seq;
  }
  return undefined;
}

_onMessage(topic, message) {
  let json = JSON.parse(message.toString());
  const seqId = this.findSequenceId(json);
  if (topic === this.topics.report && seqId && this._responseCallbacks.has(seqId)) {
    const resolve = this._responseCallbacks.get(seqId);
    console.log("_responseCallbacks", this._responseCallbacks);
    this._responseCallbacks.delete(seqId);
    console.log("_responseCallbacks", this._responseCallbacks);
    resolve(json);
  }
}


publish(topic, payload) {
  return new Promise((resolve, reject) => {
    this.client.publish(topic, JSON.stringify(payload), err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Publish + wait for matching report (oder Timeout)
 * @param {string} topic 
 * @param {object} payload 
 * @param {number} timeout in ms 
 * @returns {Promise<object>} die empfangene Report-Nachricht als JSON
 */
request(topic, payload, timeout = 5000) {
  const seqId = payload.system.sequence_id;
  return new Promise(async (resolve, reject) => {
    // Callback registrieren
    this._responseCallbacks.set(seqId, resolve);
    // Nachricht abschicken
    try {
      await this.publish(topic, payload);
    } catch (err) {
      this._responseCallbacks.delete(seqId);
      return reject(err);
    }
    // Timeout-Mechanismus
    setTimeout(() => {
      if (this._responseCallbacks.has(seqId)) {
        this._responseCallbacks.delete(seqId);
        reject(new Error(`Timeout: kein Report für ${seqId}`));
      }
    }, timeout);
  });
}
}

export default new MqttService();
