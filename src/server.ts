import http, { Server } from 'http';
import app from './app';
import { config } from './config';
import mqttService from './services/mqttService';
import websocketService from './services/websocketService';
import mqttProxyService from './services/mqttProxyService';

// HTTP-Server als Express-Instanz
const server: Server = http.createServer(app);

// Services initialisieren
mqttProxyService.init();
mqttService.init(mqttProxyService);
websocketService.init(server);

// Beispiel: zyklisches Broadcasting („Heartbeat“ alle 15 Sekunden)
setInterval(() => {
  websocketService.broadcast({ type: 'heartbeat', timestamp: new Date() });
}, 15_000);

// Server starten
server.listen(config.port, () => {
  console.log(`[Express] 🚀 Server läuft auf Port ${config.port}`);
});

export default server;
