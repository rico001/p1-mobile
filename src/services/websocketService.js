// services/WebSocketService.js
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

class WebSocketService {
  constructor() {
    this.clients = new Map();
  }

  init(server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws) => {
      const clientId = uuidv4();
      this.clients.set(clientId, ws);
      ws.clientId = clientId;

      ws.on('message', (message) => {
        console.log(`[WebSocket] Nachricht von ${clientId}:`, message.toString());
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[WebSocket] Client ${clientId} getrennt`);
      });

      ws.send(JSON.stringify({ type: 'welcome', clientId }));
    });

    console.log('[WebSocket] ✅ Service gestartet');
  }

  sendToClient(clientId, message) {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    for (const ws of this.clients.values()) {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    }
  }

  getClientIds() {
    return [...this.clients.keys()];
  }
}

export default new WebSocketService();
