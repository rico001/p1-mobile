import http from 'http';
import https from 'https';
import { URL } from 'url';
import { config } from '../config/index.js';

export const videoStream = (req, res) => {

  const upstream = config.video.videoStreamUrl;

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
