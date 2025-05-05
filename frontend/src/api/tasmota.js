// src/tasmotaApi.js
const PROXY_BASE = '/api/tasmota';

export async function getTasmotaSwitch() {
  const res = await fetch(`${PROXY_BASE}/status`);
  if (!res.ok) {
    return null
  }
  // alias "switch" -> switchState
  const { switch: switchState } = await res.json();
  return switchState;
}

export async function toggleTasmotaSwitch() {
  const res = await fetch(`${PROXY_BASE}/toggle`);
  if (!res.ok) throw new Error('Fehler beim Umschalten');
  const { switch: switchState } = await res.json();
  return switchState;
}

export async function turnOnTasmotaSwitch() {
  const res = await fetch(`${PROXY_BASE}/turn-on`);
  if (!res.ok) throw new Error('Fehler beim Einschalten');
  const { switch: switchState } = await res.json();
  return switchState;
}

export async function turnOffTasmotaSwitch() {
  const res = await fetch(`${PROXY_BASE}/turn-off`);
  if (!res.ok) throw new Error('Fehler beim Ausschalten');
  const { switch: switchState } = await res.json();
  return switchState;
}
