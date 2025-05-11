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
  setAMS,
  setSpdLvl,
  setLog,
} from '../store/printerSlice';
import useWebSocket from '../hooks/useWebsocket';

const getWebSocketUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'ws://localhost:3000';
  }
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

      //several_logs or several messages
      if (type === 'several_logs' && Array.isArray(payload)) {
        payload.forEach((entry) => {
          const { type, payload } = entry;
          handleMessage(type, payload);
        });
      } else if (type === 'several' && Array.isArray(payload)) {
        payload.forEach((entry) => {
          const { type, payload } = entry;
          handleMessage(type, payload);
        });
      } else {
        ///simple single message
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
      case 'ams_update':
        console.log('ams_update', payload);
        dispatch(setAMS(payload));
        break;
      case 'spd_lvl_update':
        console.log('spd_lvl_update', payload);
        dispatch(setSpdLvl(payload));
        break;
      case 'log_update':
        //console.log('log_update message from', payload.type)
        dispatch(setLog(payload));       
        break;
      default:
        break;
    }
  }

  return null;
}