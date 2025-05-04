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
    //console.log("json", json);
    if (json?.print?.command === 'push_status') {
      // Nur definierte Felder
      const updatedFields = Object.fromEntries(
        Object.entries(json.print).filter(([_, v]) => v !== undefined)
      );

      const prevState = { ...(this.state || {}) };
      this.state = { ...prevState, ...updatedFields };

      this._broadcastUpdatedFields(updatedFields, prevState);
    }
  }

  deepObjectKeys = {
    lights_report: ({ newVal, oldVal }) => {
      const firstLight = newVal[0];
      if (!firstLight) return; // nichts zu tun, wenn kein Eintrag
      const prevFirst = (oldVal || [])[0] || {};
      if (firstLight.mode !== prevFirst.mode) {
        websocketService.broadcast({
          type: `${firstLight.node}_mode_update`,
          payload: firstLight.mode
        });
      }
    },
    ams: ({ newVal, oldVal }) => {
      //compare with striffiy JSON
      const newValStr = JSON.stringify(newVal?.ams);
      const oldValStr = JSON.stringify(oldVal?.ams || {});
      if (newValStr !== oldValStr) {
        //log the difference
        websocketService.broadcast({
          type: `ams_update`,
          payload: newVal
        });
       
        //for test purpose
        //mc_remaining_time, mc_percent, layer_num, total_layer_num
        //websocketService.broadcast({
        //  type: `mc_remaining_time_update`,
        //  payload: 4
        //});
      }
    }
  };

  flatKeys = [
    'print_type', 'wifi_signal',
    'nozzle_temper','nozzle_target_temper',
    'bed_temper','bed_target_temper',
    'mc_percent','mc_remaining_time',
    'layer_num','total_layer_num',
    'gcode_file'
  ];
  _broadcastUpdatedFields(updatedFields, prevState) {
    Object.entries(updatedFields).forEach(([key, newVal]) => {
      const oldVal = prevState[key];

      // 1) Gibt es einen Custom-Broadcaster?
      if (this.deepObjectKeys[key]) {
        this.deepObjectKeys[key]({ newVal, oldVal });
        console.log(`new ${key}`, newVal);
        return;
      }

      // 2) Ist der Key in defaultKeys?
      if (this.flatKeys.includes(key)) {
        const changed = newVal !== oldVal;
        if (changed) {
          websocketService.broadcast({
            type: `${key}_update`,
            payload: newVal
          });
          console.log(`new ${key}`, newVal);
        }
      }
      // 3) Sonstige Keys werden ignoriert
    });
  }


  publish(topic, payload) {
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
