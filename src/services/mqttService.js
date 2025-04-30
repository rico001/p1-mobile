// mqttService.js
import fs from 'fs';
import mqtt from 'mqtt';
import EventEmitter from 'events';
import { config } from '../config/index.js';
import { generateClientId } from '../utils/clientIdGenerator.js';

class MqttService extends EventEmitter {
  constructor( mqttConfig = config.mqtt) {
    super();
    this.client = null;
    this.clientId = generateClientId();
    this.config = mqttConfig;

    // Map von sequence_id → resolve-Funktion
    this._responseCallbacks = new Map();
  }

  init() {
    if (!fs.existsSync(this.config.caCertPath)) {
      throw new Error(`Zertifikat nicht gefunden: ${this.config.caCertPath}`);
    }
    const ca = fs.readFileSync(this.config.caCertPath);
    const opts = {
      clientId: this.clientId,
      username: this.config.username,
      password: this.config.password,
      clean: true,
      reconnectPeriod: 1000,
      keepalive: 20,
      rejectUnauthorized: false,
      ca
    };
    this.client = mqtt.connect(this.config.brokerUrl, opts);
    this._registerEvents();
  }

  _registerEvents() {
    this.client.on('connect', () => {
      console.log('[MQTT] ✅ Verbunden');
      this.client.subscribe(this.config.topics.report, err => {
        if (err) console.error('[MQTT] ❌ Subscribe-Fehler:', err);
        else console.log(`[MQTT] 📡 Subscribed to '${this.config.topics.report}'`);
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
  console.log("message", json);
  if (topic === this.config.topics.report && seqId && this._responseCallbacks.has(seqId)) {
    const resolve = this._responseCallbacks.get(seqId);
    console.log("_responseCallbacks", this._responseCallbacks);
    this._responseCallbacks.delete(seqId);
    //console.log("_responseCallbacks", this._responseCallbacks);
    resolve(json);
  }
}


publish(topic, payload) {
  console.log("publish", topic, payload);
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
request(payload, seqId, timeout = 5000) {
  console.log("seqId", seqId);
  return new Promise(async (resolve, reject) => {
    // Callback registrieren
    this._responseCallbacks.set(seqId, resolve);
    // Nachricht abschicken
    try {
      await this.publish(this.config.topics.request, payload);
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
