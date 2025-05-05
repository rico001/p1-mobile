import tls from 'tls';
import { config } from '../config/index.js';

export const videoStream = (req, res) => {

  // HTTP-Response auf MJPEG einstellen
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=--frame',
    'Cache-Control': 'no-cache',
    'Connection': 'close'
  });

  // TLS-Verbindung zum Drucker
  const socket = tls.connect({
    host: config.video.ip,
    port: config.video.port || 6000,
    rejectUnauthorized: false // falls selbstsigniertes Zertifikat
  }, () => {
    // Auth-Paket zusammenbauen
    const usernameBuf = Buffer.alloc(32, 0);
    usernameBuf.write(config.video.user || 'bblp');
    const passwordBuf = Buffer.alloc(32, 0);
    passwordBuf.write(config.video.password);

    const authBuf = Buffer.alloc(4 + 4 + 4 + 4 + 32 + 32);
    let offset = 0;
    authBuf.writeUInt32LE(0x40, offset);       offset += 4; // Payload size
    authBuf.writeUInt32LE(0x3000, offset);     offset += 4; // Type
    authBuf.writeUInt32LE(0, offset);          offset += 4; // Flags
    authBuf.writeUInt32LE(0, offset);          offset += 4; // Reserved
    usernameBuf.copy(authBuf, offset);         offset += 32; // Username
    passwordBuf.copy(authBuf, offset);                      // Password

    socket.write(authBuf);
  });

  // State für Parsen
  let buffer = Buffer.alloc(0);
  let expectingHeader = true;
  let bytesNeeded = 16; // erst Header

  socket.on('data', chunk => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= bytesNeeded) {
      if (expectingHeader) {
        // Header auslesen
        const payloadSize = buffer.readUInt32LE(0);
        buffer = buffer.slice(16);
        expectingHeader = false;
        bytesNeeded = payloadSize;
      } else {
        // komplettes JPEG-Payload da
        const jpg = buffer.slice(0, bytesNeeded);
        buffer = buffer.slice(bytesNeeded);
        expectingHeader = true;
        bytesNeeded = 16;

        // Verifikation der Magic Bytes
        if (
          jpg[0] === 0xFF && jpg[1] === 0xD8 &&
          jpg[jpg.length - 2] === 0xFF && jpg[jpg.length - 1] === 0xD9
        ) {
          // Frame an Client senden
          res.write(`--frame\r\n`);
          res.write(`Content-Type: image/jpeg\r\n`);
          res.write(`Content-Length: ${jpg.length}\r\n\r\n`);
          res.write(jpg);
          res.write('\r\n');
        } else {
          console.warn('Ungültiges JPEG-Frame empfangen');
        }
      }
    }
  });

  socket.on('error', err => {
    console.error('Socket-Fehler:', err);
    res.end();
  });

  // Wenn Client die Verbindung schließt, schließen wir auch den Socket
  req.on('close', () => {
    socket.destroy();
  });
};
