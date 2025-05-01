// mqttService.js
import fs from 'fs';
import mqtt from 'mqtt';
import EventEmitter from 'events';
import { config } from '../config/index.js';
import { delay, generateClientId } from '../utils/functions.js';
import websocketService from './websocketService.js';

class MqttService extends EventEmitter {
  constructor(mqttConfig = config.mqtt) {
    super();
    this.client = null;
    this.clientId = generateClientId();
    this.config = mqttConfig;

    // Map von sequence_id → resolve-Funktion
    this._responseCallbacks = new Map();
    this.state = {}
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
    const getStatePayload = {
      pushing: {
        sequence_id: "init_state" + Date.now(),
        command: "pushall",
        version: 1,
        push_target: 1
      }
    }
    this.publish(this.config.topics.request, getStatePayload);
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
  
    // 1) normale Antwort-Callbacks
    if (
      topic === this.config.topics.report &&
      seqId &&
      this._responseCallbacks.has(seqId) &&
      json?.print?.command !== 'push_status'
    ) {
      const resolve = this._responseCallbacks.get(seqId);
      this._responseCallbacks.delete(seqId);
      resolve(json);
      return;
    }
  
    // 2) push_status: Merge und Broadcast
    console.log("json", json);
    if (json?.print?.command === 'push_status') {
      // Nur Felder übernehmen, die definiert sind (≠ undefined)
      const updatedFields = Object.fromEntries(
        Object.entries(json.print).filter(([_, v]) => v !== undefined)
      );
      //console.log("updatedFields", updatedFields);
  
      // Merge
      this.state = {
        ...this.state,
        ...updatedFields
      };
  
      if (updatedFields.hasOwnProperty('print_type')) {
        console.log("new print_type", this.state.print_type);
        websocketService.broadcast({
          type: "print_type_update",
          payload: this.state.print_type
        });
      }
    }
  }
  


  publish(topic, payload) {
    console.log("publish", topic, payload);
    this.client.publish(topic, JSON.stringify(payload))
  }

  async getLastStateReport(payload) {
    //this.publish(this.config.topics.request, payload);
    //nach 3 s sende den state 
    //await delay(3000);
    return this.state;
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
