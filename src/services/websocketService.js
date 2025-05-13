// src/services/WebSocketService.js
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

class WebSocketService {
  constructor() {
    this.clients = new Map();
    this.lastMessages = new Map(); 
    this.logs = [];
  }

  init(server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws) => {
      const clientId = uuidv4();
      this.clients.set(clientId, ws);
      ws.clientId = clientId;

      // Direkt nach der Verbindung: Begrüßung
      ws.send(JSON.stringify({ type: 'welcome', clientId }));

      // Sende alle zuletzt gespeicherten Nachrichten in einer Nachricht vom Typ 'several', payload ist ein Array mit {type:..., payload: ...}
      const payload = [...this.lastMessages.entries()].map(([type, payload]) => ({ type, payload }));
      ws.send(JSON.stringify({ type:'several', payload }));
      // Sende alle Logs
      ws.send(JSON.stringify({ type: 'several_logs', payload: this.logs }));
      

      ws.on('message', (message) => {
        console.log(`[WebSocket] Nachricht von ${clientId}:`, message.toString());
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[WebSocket] Client ${clientId} getrennt`);
      });
    });

    console.log('[WebSocket] ✅ Service gestartet');
  }

  sendToClient(clientId, message) {
    const ws = this.clients.get(clientId);
    if (message.type) {
      this.lastMessages.set(message.type, message.payload);
    }
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  broadcast(message) {
    if (message.type) {
      this.lastMessages.set(message.type, message.payload);
    }
    const data = JSON.stringify(message);
    for (const ws of this.clients.values()) {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    }
  }

  broadcastLog(message) {
    const data = JSON.stringify(message);
    if (this.logs.length >= 100) {
      this.logs.shift();
    }
    this.logs.push(message);

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
