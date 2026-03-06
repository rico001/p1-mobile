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
      const ws = socketRef.current;
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        return;
      }

      const newWs = new WebSocket(url);
      socketRef.current = newWs;

      newWs.onopen = (ev) => {
        reconnectAttempts.current = 0;
        onOpen?.(ev);
      };

      newWs.onmessage = onMessage;

      newWs.onclose = (ev) => {
        onClose?.(ev);
        if (shouldReconnectRef.current && isMounted) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
          reconnectAttempts.current += 1;
          setTimeout(connect, delay);
        }
      };

      newWs.onerror = (err) => {
        console.error('[WS] Fehler', err);
      };
    };

    connect();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ws = socketRef.current;
        if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
          reconnectAttempts.current = 0;
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      shouldReconnectRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      const ws = socketRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [url, onOpen, onMessage, onClose]);

  return socketRef.current;
}
