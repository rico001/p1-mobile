import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { EventEmitter } from 'events';
import { config, MQTTProxyConfig } from '../config/index';
import { generateClientId } from '../utils/functions';


class MqttProxyService extends EventEmitter {
  private client: MqttClient | null = null;
  private enabled: boolean = false;
  private clientId: string;
  private config: MQTTProxyConfig;
  private rootTopic: string = '';

  constructor(mqttProxyConfig: MQTTProxyConfig) {
    super();
    this.clientId = generateClientId();
    this.config = mqttProxyConfig;
  }

  /**
   * Initialisiert den MQTT-Proxy (Verbindung & Event-Registration).
   */
  public init(): void {
    if(this.config.enabled === false || !this.config.brokerUrl || !this.config.topicPrefix) {
      console.warn('[MQTT-PROXY] ❗ MQTT-Proxy ist deaktiviert oder Konfiguration unvollständig.');
      return;
    }
    const opts: IClientOptions = {
      clientId: this.clientId,
      username: this.config.username,
      password: this.config.password,
      clean: true,
      reconnectPeriod: 1000,
      keepalive: 15,
      rejectUnauthorized: false,
    };

    this.enabled = this.config.enabled;
    this.rootTopic = this.config.topicPrefix;
    this.client = mqtt.connect(this.config.brokerUrl, opts);

    this.registerEvents();
  }

  /**
   * Registriert interne Event-Handler.
   */
  private registerEvents(): void {
    if (!this.client) return;
    this.client.on('connect', this.onConnect.bind(this));
    this.client.on('error', this.onError.bind(this));
  }

  /**
   * Handler für Verbindungsfehler.
   */
  private onError(err: Error): void {
    console.error('[MQTT-PROXY] ❌ Verbindungsfehler:', err);
  }

  /**
   * Handler für erfolgreiche Verbindung.
   */
  private onConnect(): void {
    console.log('[MQTT-PROXY] ✅ Verbunden mit MQTT-Broker:', this.config.brokerUrl);
  }

  /**
   * Publiziert eine Nachricht über den Proxy.
   * @param topic Topic-Teil (wird um rootTopic erweitert)
   * @param payload Beliebige Nutzlast, die serialisiert wird
   */
  public publish(topic: string, payload: unknown): void {
    if (!this.enabled || !this.client) {
      console.warn('[MQTT-PROXY] ❗ MQTT-Proxy ist deaktiviert oder nicht initialisiert.');
      return;
    }

    const fullTopic = `${this.rootTopic}/${topic}`;
    this.client.publish(
      fullTopic,
      JSON.stringify(payload),
      { qos: 1 },
      (err?: Error) => {
        if (err) {
          console.error(`[MQTT-PROXY] ❌ Fehler beim Senden an ${fullTopic}:`, err);
        } else {
          console.log(`[MQTT-PROXY] ✅ Nachricht gesendet an ${fullTopic}`);
        }
      }
    );
  }
}

export default new MqttProxyService(config.mqttProxy);
