
export async function setAmsTrayApi({
  amsIndex,
  trayIndex,
  trayColor,
  trayType,
  tempMax,
  tempMin,
}) {
  console.log('setAmsTrayApi', {
    amsIndex,
    trayIndex,
    trayColor,
    trayType,
    tempMax,
    tempMin,
  });

  if (typeof amsIndex !== 'number' || typeof trayIndex !== 'number' || !trayColor || !trayType || !tempMax || !tempMin) {
    throw new Error('Invalid parameters');
  }

  const query = new URLSearchParams({
    amsIndex: String(amsIndex),
    trayIndex: String(trayIndex),
    trayColor,
    trayType,
    tempMax: String(tempMax),
    tempMin: String(tempMin),
  }).toString();

  const res = await fetch(`api/mqtt/print/ams/tray/set?${query}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Fehler beim Setzen des Trays: ${res.status} ${errText}`);
  }
  return res.json();
}


export async function unloadAmsApi() {
  const res = await fetch(`api/mqtt/print/ams/unload`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Fehler beim Entladen des Trays: ${res.status} ${errText}`);
  }
  return res.json();
}