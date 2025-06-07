import tls, { TLSSocket } from 'tls';
import http from 'http';
import https from 'https';
import { Request, Response } from 'express';

import { config } from '../config/index';

let activeSocket: TLSSocket | null;
let activeTimer: NodeJS.Timeout | null;

console.log('Video-Config: ', config.video);

/**
 * Baut eine TLS-Verbindung auf, liest MJPEG-Frames
 * und schreibt sie direkt in die HTTP-Antwort.
 */
export const videoStream = (req: Request, res: Response): void => {
  // 1) Alte Connection killen
  if (activeSocket) {
    activeSocket.destroy();
    if (activeTimer) clearTimeout(activeTimer);
    activeSocket = null;
  }

  // 2) HTTP-Header für MJPEG
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=--frame',
    'Cache-Control': 'no-cache',
    Connection: 'close',
  });

  // 3) Parser-State pro Request
  let buffer = Buffer.alloc(0);
  let expectingHeader = true;
  let bytesNeeded = 16;

  // 4) Timeout, wenn keine Frames kommen
  const resetTimer = (): void => {
    if (activeTimer) clearTimeout(activeTimer);
    activeTimer = setTimeout(() => {
      console.warn('Keine Frames – schließe Verbindung');
      if (activeSocket) activeSocket.destroy();
    }, 15000);
  };

  // 5) Connect und Auth
  activeSocket = tls.connect(
    {
      host: config.video.ip,
      port: config.video.port || 6000,
      rejectUnauthorized: false,
    },
    () => {
      const u = Buffer.alloc(32);
      u.write(config.video.user);
      const p = Buffer.alloc(32);
      p.write(config.video.password);
      const auth = Buffer.alloc(4 + 4 + 4 + 4 + 32 + 32);
      let off = 0;
      auth.writeUInt32LE(0x40, off);
      off += 4;
      auth.writeUInt32LE(0x3000, off);
      off += 4;
      auth.writeUInt32LE(0, off);
      off += 4;
      auth.writeUInt32LE(0, off);
      off += 4;
      u.copy(auth, off);
      off += 32;
      p.copy(auth, off);
      activeSocket!.write(auth);
      resetTimer();
    }
  );

  // 6) Daten empfangen und parsen
  activeSocket.on('data', (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= bytesNeeded) {
      if (expectingHeader) {
        bytesNeeded = buffer.readUInt32LE(0);
        buffer = buffer.slice(16);
        expectingHeader = false;
      } else {
        const jpg = buffer.slice(0, bytesNeeded);
        buffer = buffer.slice(bytesNeeded);
        expectingHeader = true;
        bytesNeeded = 16;
        if (
          jpg[0] === 0xff &&
          jpg[1] === 0xd8 &&
          jpg[jpg.length - 2] === 0xff &&
          jpg[jpg.length - 1] === 0xd9
        ) {
          res.write(`--frame\r\n`);
          res.write(`Content-Type: image/jpeg\r\n`);
          res.write(`Content-Length: ${jpg.length}\r\n\r\n`);
          res.write(jpg);
          res.write('\r\n');
          resetTimer();
        } else {
          console.warn('Ungültiges JPEG-Frame');
        }
      }
    }
  });

  activeSocket.on('error', (err: Error) => {
    console.error('Stream-Fehler:', err);
    res.end();
  });

  // 7) Cleanup bei Client-Close
  req.on('close', (): void => {
    if (activeSocket) {
      activeSocket.destroy();
      if (activeTimer) clearTimeout(activeTimer);
      activeSocket = null;
    }
  });
};

/**
 * Proxyt externen Stream auf Basis der URL.
 */
const videoStreamExtern = (req: Request, res: Response, streamUrl: string): void => {
  const isHttps = streamUrl.startsWith('https://');
  const client = isHttps ? https : http;

  const upstreamReq = client.get(streamUrl, upstreamRes => {
    res.writeHead(upstreamRes.statusCode || 200, upstreamRes.headers);
    upstreamRes.pipe(res);
  });

  upstreamReq.on('error', (err: Error) => {
    console.error('Stream-Proxy-Error:', err);
    if (!res.headersSent) {
      res.status(502).send('Bad Gateway: ' + err.message);
    } else {
      res.end();
    }
  });

  req.on('close', () => upstreamReq.destroy());
};

export const videoStreamExtern1 = (req: Request, res: Response): void =>
  videoStreamExtern(req, res, config.video.externalStreams[0].url);

export const videoStreamExtern2 = (req: Request, res: Response): void =>
  videoStreamExtern(req, res, config.video.externalStreams[1].url);
