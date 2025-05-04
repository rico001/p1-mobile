import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const config = {
  port: process.env.SERVER_PORT || 3000,
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_ADDRESS,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    serialNumber: process.env.PRINTER_SERIAL_NUMBER,
    caCertPath: path.join(process.cwd(), process.env.PRINTER_CA_CERT_PATH),
    topics: {
      report: `device/${process.env.PRINTER_SERIAL_NUMBER}/report`,
      request: `device/${process.env.PRINTER_SERIAL_NUMBER}/request`
    }
  },
  ftp: {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    port : process.env.FTP_PORT,
    password: process.env.FTP_PASSWORD,
    secure: process.env.FTP_SECURE
  },
  video: {
    videoStreamUrl1: process.env.VIDEO_STREAM_URL_1,
    videoStreamUrl2: process.env.VIDEO_STREAM_URL_2,
  },
  puppeteer: {
    headless: process.env.PUPPETEER_HEADLESS === 'true',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  },
  tasmota: {
    ip: process.env.TASMOTA_SWITCH_IP,
  },

};
console.log('[Config] Konfiguration geladen:', config);

export { config };
