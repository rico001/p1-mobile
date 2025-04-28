import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  mqtt: {
    brokerUrl: process.env.BROKER_ADDRESS,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    serialNumber: process.env.SERIAL_NUMBER,
    caCertPath: path.join(process.cwd(), process.env.CA_CERT_PATH),
    topics: {
      report: `device/${process.env.SERIAL_NUMBER}/report`,
      request: `device/${process.env.SERIAL_NUMBER}/request`
    }
  }
};
console.log('[Config] Konfiguration geladen:', config);

export { config };
