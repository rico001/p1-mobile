import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const config = {
  port: process.env.SERVER_PORT || 3000,
  mqtt: {
    brokerUrl: `mqtts://${process.env.PRINTER_IP}:${process.env.PRINTER_MQTT_PORT}`,
    username: process.env.PRINTER_USER,
    password: process.env.PRINTER_ACCESS_CODE,
    serialNumber: process.env.PRINTER_SERIAL_NUMBER,
    caCertPath: path.join(process.cwd(), process.env.PRINTER_CA_CERT_PATH),
    topics: {
      report: `device/${process.env.PRINTER_SERIAL_NUMBER}/report`,
      request: `device/${process.env.PRINTER_SERIAL_NUMBER}/request`
    }
  },
  ftp: {
    host: process.env.PRINTER_IP,
    user: process.env.PRINTER_USER,
    port : process.env.PRINTER_FTP_PORT,
    password: process.env.PRINTER_ACCESS_CODE,
    secure: 'implicit'
  },
  video: {
    user: process.env.PRINTER_USER,
    password: process.env.PRINTER_ACCESS_CODE,
    ip: process.env.PRINTER_IP,
    port: process.env.PRINTER_VIDEO_PORT,
  },
  puppeteer: {
    headless: process.env.PUPPETEER_HEADLESS === 'true',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  },
  offlineDetection: {
    timeout: process.env.OFFLINE_DETECTION_TIMEOUT_MS || 5000,
    interval: process.env.OFFLINE_DETECTION_INTERVAL_MS || 2000,
    ip: process.env.PRINTER_IP,
  },
  tasmota: {
    ip: process.env.TASMOTA_SWITCH_IP,
  },

};
console.log('[Config] Konfiguration geladen:', config);

export { config };
