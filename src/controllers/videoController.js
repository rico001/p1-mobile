import tls from 'tls';
import { config } from '../config/index.js';

let activeSocket;
let activeTimer;

/**
 * Baut eine TLS-Verbindung auf, liest MJPEG-Frames
 * und schreibt sie direkt in die HTTP-Antwort.
 */
export const videoStream = (req, res) => {
  // 1) Alte Connection killen
  if (activeSocket) {
    activeSocket.destroy();
    clearTimeout(activeTimer);
    activeSocket = null;
  }

  // 2) HTTP-Header für MJPEG
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=--frame',
    'Cache-Control': 'no-cache',
    'Connection': 'close'
  });

  // 3) Parser-State pro Request
  let buffer = Buffer.alloc(0);
  let expectingHeader = true;
  let bytesNeeded = 16;

  // 4) Timeout, wenn keine Frames kommen
  const resetTimer = () => {
    clearTimeout(activeTimer);
    activeTimer = setTimeout(() => {
      console.warn('Keine Frames – schließe Verbindung');
      activeSocket.destroy();
    }, 15000);
  };

  // 5) Connect und Auth
  activeSocket = tls.connect({
    host: config.video.ip,
    port: config.video.port || 6000,
    rejectUnauthorized: false
  }, () => {
    const u = Buffer.alloc(32); u.write(config.video.user);
    const p = Buffer.alloc(32); p.write(config.video.password);
    const auth = Buffer.alloc(4+4+4+4+32+32);
    let off = 0;
    auth.writeUInt32LE(0x40, off);   off += 4;
    auth.writeUInt32LE(0x3000, off); off += 4;
    auth.writeUInt32LE(0, off);      off += 4;
    auth.writeUInt32LE(0, off);      off += 4;
    u.copy(auth, off);               off += 32;
    p.copy(auth, off);
    activeSocket.write(auth);
    resetTimer();
  });

  // 6) Daten empfangen und parsen
  activeSocket.on('data', chunk => {
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
          jpg[0] === 0xFF && jpg[1] === 0xD8 &&
          jpg[jpg.length-2] === 0xFF && jpg[jpg.length-1] === 0xD9
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

  activeSocket.on('error', err => {
    console.error('Stream-Fehler:', err);
    res.end();
  });

  // 7) Cleanup bei Client-Close
  req.on('close', () => {
    if (activeSocket) {
      activeSocket.destroy();
      clearTimeout(activeTimer);
      activeSocket = null;
    }
  });
};
