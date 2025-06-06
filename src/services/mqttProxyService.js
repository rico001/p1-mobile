import fs from 'fs';
import mqtt from 'mqtt';
import EventEmitter from 'events';
import { config } from '../config/index.js';
import { generateClientId } from '../utils/functions.js';

class MqttProxyService extends EventEmitter {

  constructor(mqttProxyConfig = config.mqttProxy) {
    super();
    this.client = null;
    this.enabled = false;
    this.clientId = generateClientId();
    this.config = mqttProxyConfig;
    this.rootTopic = '';
  }

  init() {
    const opts = {
      clientId: this.clientId,
      username: this.config.username,
      password: this.config.password,
      clean: true,
      reconnectPeriod: 1000,
      keepalive: 15,
      rejectUnauthorized: false,
    };
    this.enabled = this.config.enabled;
    this.rootTopic = this.config.topicPrefix || 'bambu-p1s';
    this.client = mqtt.connect(this.config.brokerUrl, opts);

    this._registerEvents();
  }

  _registerEvents() {
    this.client.on('connect', this._onConnect.bind(this));
    this.client.on('error', this._onError.bind(this));
  }

  //---------binded client callbacks----------

  _onError(err) {
    console.error('[MQTT-PROXY] ❌ Verbindungsfehler:', err);
  }

  _onConnect() {
    console.log('[MQTT-PROXY] ✅ Verbunden mit MQTT-Broker:', this.config.brokerUrl);
  }

  // public methods

  publish(topic, payload) {

    if (!this.enabled) {
      console.warn('[MQTT-PROXY] ❗ MQTT-Proxy ist deaktiviert. Nachricht wird nicht gesendet.');
      return;
    }
    //console.log(`[MQTT-PROXY] 📤 Sende Nachricht an ${topic}:`, payload);
    const fullTopic = `${this.rootTopic}/${topic}`;
    this.client.publish(fullTopic, JSON.stringify(payload), { qos: 1 }, (err) => {
      if (err) {
        console.error(`[MQTT-PROXY] ❌ Fehler beim Senden der Nachricht an ${fullTopic}:`, err);
      } else {
        console.log(`[MQTT-PROXY] ✅ Nachricht gesendet an ${fullTopic}`);
      }
    });
  }

}

export default new MqttProxyService();
