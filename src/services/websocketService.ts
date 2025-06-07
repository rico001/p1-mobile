import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { Server as HttpServer } from 'http';

interface Message<T = any> {
  type: string;
  payload: T;
}

export class WebSocketService {
  private clients: Map<string, WebSocket> = new Map();
  private lastMessages: Map<string, any> = new Map();
  private logs: any[] = [];
  private wss!: WebSocketServer;

  /**
   * Initialize WebSocket server on existing HTTP server
   * @param server HTTP server instance
   */
  public init(server: HttpServer): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = uuidv4();
      this.clients.set(clientId, ws);
      // Attach clientId to socket for reference
      (ws as any).clientId = clientId;

      this.sendInitMessages(ws, clientId);

      ws.on('message', (data: string | Buffer) => {
        const message = data.toString();
        console.log(`[WebSocket] Nachricht von ${clientId}:`, message);
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[WebSocket] Client ${clientId} getrennt`);
      });
    });

    console.log('[WebSocket] ✅ Service gestartet');
  }

  /**
   * Send initialization messages to new client
   * @param ws WebSocket instance
   * @param clientId UUID of the client
   */
  private sendInitMessages(ws: WebSocket, clientId: string): void {
    // Welcome message with assigned clientId
    this.sendRaw(ws, { type: 'welcome', payload: clientId });

    // Send latest messages of each type
    const severalPayload = Array.from(this.lastMessages.entries())
      .map<[string, any]>(([type, payload]) => [type, payload])
      .map(([type, payload]) => ({ type, payload }));
    this.sendRaw(ws, { type: 'several', payload: severalPayload });

    // Send all logs
    this.sendRaw(ws, { type: 'several_logs', payload: this.logs });

    // Send environment configuration
    const env = config.webSocket;
    this.sendRaw(ws, { type: 'env', payload: env });
  }

  /**
   * Send typed message to specific client
   * @param clientId UUID of the target client
   * @param message Message object
   * @returns whether send was successful
   */
  public sendToClient<T>(clientId: string, message: Message<T>): boolean {
    if (message.type) {
      this.lastMessages.set(message.type, message.payload);
    }
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  /**
   * Broadcast a message to all connected clients
   * @param message Message object
   */
  public broadcast<T>(message: Message<T>): void {
    console.log(`[WebSocket] Broadcast-Nachricht:`, message);
    if (message.type) {
      this.lastMessages.set(message.type, message.payload);
    }
    const data = JSON.stringify(message);
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  /**
   * Broadcast a log message and store it
   * @param logEntry Log message object
   */
  public broadcastLog(logEntry: any): void {
    const data = JSON.stringify(logEntry);
    // Keep only the last 100 logs
    if (this.logs.length >= 100) {
      this.logs.shift();
    }
    this.logs.push(logEntry);

    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  /**
   * Get all connected client IDs
   * @returns Array of client UUIDs
   */
  public getClientIds(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Helper to send raw JSON message
   */
  private sendRaw(ws: WebSocket, message: Message): void {
    ws.send(JSON.stringify(message));
  }
}

// Export a singleton instance
export default new WebSocketService();
