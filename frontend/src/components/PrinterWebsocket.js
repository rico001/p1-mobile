import React from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  setPrintType,
  setWifiSignal,
  setLightMode,
  setNozzleTemper,
  setNozzleTargetTemper,
  setBedTemper,
  setBedTargetTemper,
  setMcPercent,
  setMcRemainingTime,
  setLayerNum,
  setTotalLayerNum,
  setGcodeFile,
} from '../store/printerSlice';
import useWebSocket from '../hooks/useWebsocket';

const getWebSocketUrl = () => {
  const domain = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${domain}:${port}`;
}

export default function PrinterWebSocket() {
  const dispatch = useDispatch();
  useWebSocket(getWebSocketUrl(), {
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

      if (type === 'several' && Array.isArray(payload)) {
        payload.forEach((entry) => {
          const { type: entryType, payload: entryPayload } = entry;
          handleMessage(entryType, entryPayload);
        });
      } else {
        handleMessage(type, payload);
      }
    },
    onClose: () => console.log('[WS] getrennt – versuche neu zu verbinden'),
  });

  function handleMessage(type, payload) {
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
      case 'nozzle_temper_update':
        dispatch(setNozzleTemper(payload));
        break;
      case 'nozzle_target_temper_update':
        dispatch(setNozzleTargetTemper(payload));
        break;
      case 'bed_temper_update':
        dispatch(setBedTemper(payload));
        break;
      case 'bed_target_temper_update':
        dispatch(setBedTargetTemper(payload));
        break;
      case 'mc_percent_update':
        dispatch(setMcPercent(payload));
        break;
      case 'mc_remaining_time_update':
        dispatch(setMcRemainingTime(payload));
        break;
      case 'layer_num_update':
        dispatch(setLayerNum(payload));
        break;
      case 'total_layer_num_update':
        dispatch(setTotalLayerNum(payload));
        break;
      case 'gcode_file_update':
        dispatch(setGcodeFile(payload));
        break;
      default:
        break;
    }
  }

  return null;
}