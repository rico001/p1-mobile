import tls from 'tls';
import { EventEmitter } from 'events';
import { config } from '../config/index.js';

// Event-Emitter für die Verteilung der JPEG-Frames
const frameEmitter = new EventEmitter();

// Parsing-State und Socket-Referenz
let printerSocket;
let buffer = Buffer.alloc(0);
let expectingHeader = true;
let bytesNeeded = 16; // zuerst Header

// Timeout-Timer, der neu gesetzt wird, sobald ein Frame ankommt
let frameTimer;

/**
 * Setzt (bzw. resettet) den Timer, der bei Timeout
 * die Verbindung schließt, um neu zu verbinden.
 */
function resetFrameTimer() {
  // vorhandenen Timer löschen
  if (frameTimer) clearTimeout(frameTimer);

  // neuen Timer starten (hier 15s ohne Frames erlaubt)
  frameTimer = setTimeout(() => {
    console.warn('Keine Frames empfangen – reconnecting...');
    if (printerSocket) {
      printerSocket.destroy();
    }
  }, 15000);
}

function connectToPrinter() {
  // Reset von State und Timer
  buffer = Buffer.alloc(0);
  expectingHeader = true;
  bytesNeeded = 16;
  resetFrameTimer();

  printerSocket = tls.connect({
    host: config.video.ip,
    port: config.video.port || 6000,
    rejectUnauthorized: false
  }, () => {
    // Auth-Paket zusammenbauen & senden
    const usernameBuf = Buffer.alloc(32, 0);
    usernameBuf.write(config.video.user);
    const passwordBuf = Buffer.alloc(32, 0);
    passwordBuf.write(config.video.password);

    const authBuf = Buffer.alloc(4 + 4 + 4 + 4 + 32 + 32);
    let offset = 0;
    authBuf.writeUInt32LE(0x40, offset);      offset += 4;
    authBuf.writeUInt32LE(0x3000, offset);    offset += 4;
    authBuf.writeUInt32LE(0, offset);         offset += 4;
    authBuf.writeUInt32LE(0, offset);         offset += 4;
    usernameBuf.copy(authBuf, offset);        offset += 32;
    passwordBuf.copy(authBuf, offset);

    printerSocket.write(authBuf);

    // sobald wir verbunden sind, starten wir den Timeout
    resetFrameTimer();
  });

  printerSocket.on('data', chunk => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= bytesNeeded) {
      if (expectingHeader) {
        const payloadSize = buffer.readUInt32LE(0);
        buffer = buffer.slice(16);
        expectingHeader = false;
        bytesNeeded = payloadSize;
      } else {
        const jpg = buffer.slice(0, bytesNeeded);
        buffer = buffer.slice(bytesNeeded);
        expectingHeader = true;
        bytesNeeded = 16;

        // bei validem JPEG-Frame: an Clients senden und Timer resetten
        if (
          jpg[0] === 0xFF && jpg[1] === 0xD8 &&
          jpg[jpg.length - 2] === 0xFF && jpg[jpg.length - 1] === 0xD9
        ) {
          frameEmitter.emit('frame', jpg);
          resetFrameTimer();
        } else {
          console.warn('Ungültiges JPEG-Frame empfangen');
        }
      }
    }
  });

  printerSocket.on('error', err => {
    console.error('Drucker-Stream-Fehler:', err);
  });

  printerSocket.on('close', () => {
    console.warn('Verbindung zum Drucker getrennt – reconnect in 15s');
    if (frameTimer) clearTimeout(frameTimer);
    setTimeout(connectToPrinter, 15000);
  });
}

// direkt beim Modul-Import / Server-Start verbinden
connectToPrinter();

// Express-/Router-Middleware für MJPEG-Multi-Client-Streaming
export const videoStream = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=--frame',
    'Cache-Control': 'no-cache',
    'Connection': 'close'
  });

  const onFrame = (jpg) => {
    res.write(`--frame\r\n`);
    res.write(`Content-Type: image/jpeg\r\n`);
    res.write(`Content-Length: ${jpg.length}\r\n\r\n`);
    res.write(jpg);
    res.write('\r\n');
  };

  frameEmitter.on('frame', onFrame);

  req.on('close', () => {
    frameEmitter.removeListener('frame', onFrame);
  });
};
