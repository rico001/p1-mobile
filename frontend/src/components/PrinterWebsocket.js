import React from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  setPrintType,
  setWifiSignal,
  setLightMode,
} from '../store/printerSlice';
import useWebSocket from '../hooks/useWebsocket';

export default function PrinterWebSocket() {
  const dispatch = useDispatch();

  useWebSocket('ws://localhost:3000', {
    onOpen: () => console.log('[WS] verbunden'),
    onMessage: event => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        console.error('[WS] JSON-Fehler');
        return;
      }

      const { type, payload } = msg;
      switch (type) {
        case 'print_type_update':
          dispatch(setPrintType(payload));
          toast.info(`Drucker-Status: ${payload}`);
          break;
        case 'wifi_signal_update':
          dispatch(setWifiSignal(payload));
          break;
        case 'chamber_light_mode_update':
          console.log('chamber_light_mode_update', payload);
          dispatch(setLightMode(payload));
          break;
        default:
          break;
      }
    },
    onClose: () => console.log('[WS] getrennt – versuche neu zu verbinden'),
  });

  return null;
}
