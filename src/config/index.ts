// src/config/index.ts

import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

interface MQTTConfig {
  brokerUrl: string;
  username?: string;
  password?: string;
  serialNumber?: string;
  caCertPath: string;
  topics: {
    report: string;
    request: string;
  };
  errorWhitelist?: string;
}

interface FTPConfig {
  host?: string;
  user?: string;
  port?: number;
  password?: string;
  secure: 'implicit' | 'explicit' | boolean;
}

interface VideoConfig {
  user?: string;
  password?: string;
  ip?: string;
  port?: number;
  externalStreams: { url?: string }[];
}

interface TasmotaConfig {
  ip?: string;
}

interface WebSocketConfig {
  thirdPartyIframeToggleSrc: string;
}

interface MQTTProxyConfig {
  enabled: boolean;
  brokerUrl: string;
  username?: string;
  password?: string;
  topicPrefix: string;
}

export interface AppConfig {
  port: number;
  mqtt: MQTTConfig;
  ftp: FTPConfig;
  video: VideoConfig;
  tasmota: TasmotaConfig;
  webSocket: WebSocketConfig;
  mqttProxy: MQTTProxyConfig;
}

const config: AppConfig = {
  port: parseInt(process.env.SERVER_PORT ?? '3000', 10),
  mqtt: {
    brokerUrl: `mqtts://${process.env.PRINTER_IP}:${process.env.PRINTER_MQTT_PORT}`,
    username: process.env.PRINTER_USER,
    password: process.env.PRINTER_ACCESS_CODE,
    serialNumber: process.env.PRINTER_SERIAL_NUMBER,
    caCertPath: path.join(process.cwd(), process.env.PRINTER_CA_CERT_PATH ?? ''),
    topics: {
      report: `device/${process.env.PRINTER_SERIAL_NUMBER}/report`,
      request: `device/${process.env.PRINTER_SERIAL_NUMBER}/request`,
    },
    errorWhitelist: process.env.PRINTER_ERRORS_WHITELIST,
  },
  ftp: {
    host: process.env.PRINTER_IP,
    user: process.env.PRINTER_USER,
    port: process.env.PRINTER_FTP_PORT ? parseInt(process.env.PRINTER_FTP_PORT, 10) : undefined,
    password: process.env.PRINTER_ACCESS_CODE,
    secure: 'implicit',
  },
  video: {
    user: process.env.PRINTER_USER,
    password: process.env.PRINTER_ACCESS_CODE,
    ip: process.env.PRINTER_IP,
    port: process.env.PRINTER_VIDEO_PORT ? parseInt(process.env.PRINTER_VIDEO_PORT, 10) : undefined,
    externalStreams: [
      { url: process.env.EXTERN_VIDEO_STREAM_1 },
      { url: process.env.EXTERN_VIDEO_STREAM_2 },
    ],
  },
  tasmota: {
    ip: process.env.TASMOTA_SWITCH_IP,
  },
  webSocket: {
    thirdPartyIframeToggleSrc: process.env.THIRD_PARTY_IFRAME_TOGGLE_SRC ?? '',
  },
  mqttProxy: {
    enabled: process.env.PROXY_MQTT_BROKER_ENABLED === 'true',
    brokerUrl: `mqtt://${process.env.PROXY_MQTT_BROKER_IP}:${process.env.PROXY_MQTT_BROKER_PORT}`,
    username: process.env.PROXY_MQTT_BROKER_USER,
    password: process.env.PROXY_MQTT_BROKER_PASSWORD,
    topicPrefix: process.env.PROXY_MQTT_BROKER_TOPIC_PREFIX ?? 'bambu-p1s',
  },
};

console.log('[Config] Konfiguration geladen:', config);

export { config };
