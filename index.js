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
const FTP_CACHE_BASE_PATH = 'ftp:///cache/';
const FTP_MODEL_BASE_PATH = 'ftp:///model/';

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
  let json = JSON.parse(message.toString());
  if (json?.print?.sequence_id?.includes('print_file') || json?.system?.sequence_id?.includes('access_code')) {
    console.log(`[MQTT] 📥 Nachricht empfangen von '${topic}':`);
    console.log(json);
  }
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
// some tests

app.get('/print-file', (req, res) => {
  const sequence_id = "print_file-" + Date.now();
  const printFileRequest = {
    print: {
      sequence_id: sequence_id,
      command: 'project_file',
      param: 'Metadata/plate_X.gcode',
      project_id: '0',
      profile_id: '0',
      task_id: '0',
      subtask_id: '0',
      subtask_name: '',
      file: '',
      url: `${FTP_MODEL_BASE_PATH}P1S_Bed scraper by JernejP_PLA.gcode`, // URL to print. Root path, protocol can vary. E.g., if sd card, "ftp:///myfile.3mf", "ftp:///cache/myotherfile.3mf"
      md5: '',
      timelapse: true,
      bed_type: 'auto',
      bed_levelling: true,
      flow_cali: true,
      vibration_cali: true,
      layer_inspect: true,
      ams_mapping: '',
      use_ams: true
    }
  };
  client.publish(TOPIC_REQUEST, JSON.stringify(printFileRequest), { qos: 1 }, (err) => {
    if (err) {
      console.error('[MQTT] ❌ Fehler beim Publish:', err);
    } else {
      console.log(`[MQTT] 📤 Gesendet an '${TOPIC_REQUEST}'`);
    }
  });
  res.send('Print File Request gesendet');
});

// publish access code request and wait for response with a mqtt client, based on sequence_id 
app.get('/access-code', (req, res) => {
  const sequence_id = "access_code" + Date.now();
  const accessCodeRequest = {
    system: {
      sequence_id: sequence_id,
      command: 'get_access_code'
    }
  };

  client.publish(TOPIC_REQUEST, JSON.stringify(accessCodeRequest), { qos: 1 }, (err) => {
    if (err) {
      console.error('[MQTT] ❌ Fehler beim Publish:', err);
    } else {
      console.log(`[MQTT] 📤 Gesendet an '${TOPIC_REQUEST}'`);
    }
  });

  res.send('Access Code Request gesendet');
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
