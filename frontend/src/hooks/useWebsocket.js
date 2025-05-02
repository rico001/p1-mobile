import { useEffect, useRef } from 'react';

export default function useWebSocket(
  url,
  { onOpen, onMessage, onClose, shouldReconnect = true }
) {
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const shouldReconnectRef = useRef(shouldReconnect);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = (ev) => {
        reconnectAttempts.current = 0;
        onOpen?.(ev);
      };

      ws.onmessage = onMessage;

      ws.onclose = (ev) => {
        onClose?.(ev);
        if (shouldReconnectRef.current && isMounted) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
          reconnectAttempts.current += 1;
          setTimeout(connect, delay);
        }
      };

      ws.onerror = (err) => {
        console.error('[WS] Fehler', err);
      };
    };

    connect();

    return () => {
      isMounted = false;
      shouldReconnectRef.current = false;
      const ws = socketRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [url, onOpen, onMessage, onClose]);

  return socketRef.current;
}
