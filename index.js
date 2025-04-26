require('dotenv').config();
const express = require('express');
const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
const process = require('process');

// —————————————————————————
// Drucker-Konfiguration aus .env
// —————————————————————————
const BROKER_ADDRESS = process.env.BROKER_ADDRESS;
const PORT = process.env.PORT || 3000;
const USERNAME = process.env.MQTT_USERNAME;
const PASSWORD = process.env.MQTT_PASSWORD;
const SERIAL_NUMBER = process.env.SERIAL_NUMBER;
const CA_CERT_PATH = path.join(__dirname, process.env.CA_CERT_PATH);

const TOPIC_REPORT = `device/${SERIAL_NUMBER}/report`;
const TOPIC_REQUEST = `device/${SERIAL_NUMBER}/request`;

if (!fs.existsSync(CA_CERT_PATH)) {
  throw new Error(`Zertifikat nicht gefunden: ${CA_CERT_PATH}`);
}

// —————————————————————————
// Hilfsfunktion für Client-ID Generierung
// —————————————————————————
function generateClientId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let clientId = 'XTOUCH-CLIENT-';
  for (let i = 0; i < length; i++) {
    clientId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return clientId;
}

const CLIENT_ID = generateClientId();

// —————————————————————————
// MQTT-Client Optionen
// —————————————————————————
const options = {
  clientId: CLIENT_ID,
  username: USERNAME,
  password: PASSWORD,
  clean: true,
  reconnectPeriod: 1000,
  keepalive: 20,
  rejectUnauthorized: false, // Hostname-Check deaktivieren
  ca: fs.readFileSync(CA_CERT_PATH)
};

// —————————————————————————
// Express Setup
// —————————————————————————
const app = express();

// —————————————————————————
// MQTT-Client erstellen und verbinden
// —————————————————————————
console.log('[MQTT] 📡 Verbinde zu Drucker…');
const client = mqtt.connect(BROKER_ADDRESS, options);

// —————————————————————————
// MQTT Event-Handler
// —————————————————————————
client.on('connect', () => {
  console.log('[MQTT] ✅ Verbunden');
  client.subscribe(TOPIC_REPORT, (err) => {
    if (!err) {
      console.log(`[MQTT] 📡 Subscribed to '${TOPIC_REPORT}'`);
    } else {
      console.error('[MQTT] ❌ Fehler beim Subscribe:', err);
    }
  });
});

client.on('message', (topic, message) => {
  let text;
  try {
    text = message.toString();
  } catch (err) {
    text = message;
  }
  console.log(`[MQTT] 📥 ${topic} → ${text}`);
});

client.on('reconnect', () => {
  console.log('[MQTT] 🔄 Reconnecting...');
});

client.on('close', () => {
  console.log('[MQTT] ⚠️ Verbindung geschlossen');
});

client.on('error', (error) => {
  console.error('[MQTT] ❌ Fehler:', error);
});

// —————————————————————————
// Express-Server starten
// —————————————————————————
app.get('/', (req, res) => {
  res.send('MQTT Client läuft...');
});

app.listen(PORT, () => {
  console.log(`[Express] 🚀 Server läuft auf http://localhost:${PORT}`);
});

// —————————————————————————
// Prozess Beenden-Handler
// —————————————————————————
process.on('SIGINT', () => {
  console.log('\n[MQTT] ❎ Beende per SIGINT');
  client.end(false, () => {
    console.log('[MQTT] ✔️ Sauber getrennt.');
    process.exit(0);
  });
});
