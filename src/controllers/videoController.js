import http from 'http';
import https from 'https';
import { URL } from 'url';
import { config } from '../config/index.js';

export const videoStream1 = (req, res) => {

  const upstream = config.video.videoStreamUrl1;

  // Wähle das passende Modul
  const client = upstream.includes('https') ? https : http;

  client.get(upstream, upstreamRes => {
    // Status und Header übernehmen
    res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
    // Stream weiterschieben
    upstreamRes.pipe(res);
  }).on('error', err => {
    console.error('Proxy-Fehler:', err);
    if (!res.headersSent) {
      res.status(502).send('Fehler beim Laden des Streams');
    } else {
      res.end();
    }
  });
};


export const videoStream2 = (req, res) => {
  const camUrl = new URL('http://192.168.178.55:81/stream');
  const client = camUrl.protocol === 'https:' ? https : http;

  console.log('Proxy verbindet zu ESP32-CAM:', camUrl.href);

  const request = client.get(camUrl, (camRes) => {
    if (camRes.statusCode !== 200) {
      console.error(`ESP32 antwortet mit ${camRes.statusCode}`);
      res.statusCode = 502;
      return res.end('ESP32 streamt nicht');
    }

    // Weiterleiten der korrekten Content-Type mit boundary
    res.writeHead(200, {
      'Content-Type': camRes.headers['content-type'] || 'multipart/x-mixed-replace',
      'Cache-Control': 'no-cache',
      'Connection': 'close',
      'Pragma': 'no-cache',
    });

    camRes.pipe(res);

    // Verbindung sauber abbrechen, wenn Client schließt
    req.on('close', () => {
      console.log('Client hat Verbindung geschlossen – Proxy beendet Stream');
      camRes.destroy?.(); // optional
      request.destroy();  // trennt Verbindung zur Kamera
    });
  });

  request.on('error', (err) => {
    console.error('Fehler beim ESP32-Stream:', err.message);
    res.statusCode = 500;
    res.end('Proxy-Fehler');
  });

  req.setTimeout(0);
  res.setTimeout(0);
};