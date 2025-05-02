import http from 'http';
import app from './app.js';
import { config } from './config/index.js';
import mqttService from './services/mqttService.js';
import websocketService from './services/websocketService.js';

const server = http.createServer(app);

// Services initialisieren
mqttService.init();
websocketService.init(server);

// Beispiel: zyklisches Broadcasting
setInterval(() => {
  websocketService.broadcast({ type: 'heartbeat', timestamp: new Date() });
}, 15000);

server.listen(config.port, () => {
  console.log(`[Express] 🚀 Server läuft auf Port ${config.port}`);
});
