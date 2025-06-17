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
    if (!this.config.enabled || !this.config.brokerUrl || !this.config.topicPrefix) {
      console.warn('[MQTT-PROXY] ❗ MQTT-Proxy ist deaktiviert oder Konfiguration unvollständig.');
      return;
    }
    const opts: IClientOptions = {
      clientId: this.clientId,
      username: this.config.username,
      password: this.config.password,
      clean: true,
      reconnectPeriod: 10000,
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
    this.client.on('close', this.onClose.bind(this));
    this.client.on('offline', this.onOffline.bind(this));
    this.client.on('error', this.onError.bind(this));
    this.client.on('reconnect', this.onReconnect.bind(this));
  }

  private onConnect(): void {
    console.log('[MQTT-PROXY] ✅ Verbunden mit MQTT-Broker:', this.config.brokerUrl);
  }

  /** Reconnect-Handler */
  private onReconnect(): void {
    console.log('[MQTT-PROXY] 🔄 Reconnecting...') 
  }

  private tryReconnect(err: Error | null = null): void {
    setTimeout(() => {
      console.log('[MQTT-PROXY] 🔄 try reconnect after error')
      this.client?.reconnect();
    }, 5000);
  }

  private onOffline(): void {
    console.warn('[MQTT-PROXY] 📴 Client ist offline.');
  }

  private onClose(): void {
    console.warn('[MQTT-PROXY] ⚠️ Verbindung geschlossen.');
  }

  private onError(err: Error): void {
    console.error('[MQTT-PROXY] ❌ Verbindungsfehler');
    this.tryReconnect(err);
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
