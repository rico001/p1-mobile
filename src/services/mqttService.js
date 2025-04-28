import fs from 'fs';
import mqtt from 'mqtt';
import { config } from '../config/index.js';
import { generateClientId } from '../utils/clientIdGenerator.js';

class MqttService {
  constructor() {
    this.client = null;
    this.clientId = generateClientId();
    this.topics = config.mqtt.topics;
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
    this.client.on('reconnect', () => console.log('[MQTT] 🔄 Reconnecting...'));
    this.client.on('close', () => console.log('[MQTT] ⚠️ Verbindung geschlossen'));
    this.client.on('error', err => console.error('[MQTT] ❌ Fehler:', err));
  }

  _onMessage(topic, message) {
    // "command": "get_access_code"
    //check in raw string  "command": "get_access_code" included
    if (message.toString().includes('get_access_code')) {
      //console.log('[MQTT] 📥 Access Code erhalten');
      // Hier können Sie den Access Code verarbeiten
    }
    const json = JSON.parse(message.toString());
    //console.log(`[MQTT] 📥 Nachricht auf '${topic}':`);
    //console.log(JSON.stringify(json, null, 2));
  }

  publish(topic, payload) {
    return new Promise((resolve, reject) => {
      this.client.publish(topic, JSON.stringify(payload), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

}

export default new MqttService();
