// src/api/printHead.js
export async function movePrintHead({ axis, value }) {
    const res = await fetch(`/api/mqtt/move-print-head?axis=${axis}&value=${value}`, {
        method: 'GET',
    });
    if (!res.ok) {
        throw new Error(`Move failed: ${res.statusText}`);
    }
    return res.json();
}

export async function movePrintHeadHome() {
    const res = await fetch('/api/mqtt/move-print-head-home', {
        method: 'GET',
    });
    if (!res.ok) {
        throw new Error(`Move home failed: ${res.statusText}`);
    }
    return res.json();
}

export async function setLight(value) {
    const res = await fetch(`/api/mqtt/set-light?value=${value}`, { method: 'GET' });
    if (!res.ok) throw new Error(`Set light failed: ${res.statusText}`);
    return res.json();
}

export async function getAmsState(value) {
    const res = await fetch('/api/mqtt/state', {
        method: 'GET',
    });
    if (!res.ok) {
        throw new Error(`Get AMS state failed: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data || !data.report || !data.report.ams) {
        throw new Error('Invalid AMS state response');
    }
    const trays = data.report.ams.ams.map(ams => ams.tray.map(tray => ({
        tray_type: tray.tray_type,
        tray_color: tray.tray_color,
    })));
    console.log(trays);
    // example: [{tray_type: 'PLA', tray_color: 'FF6A13FF'}, {tray_type: 'ABS', tray_color: 'FF0000FF'}]
    return trays
}

/*
{
  "report": {
    "lights_report": [
      {
        "node": "chamber_light",
        "mode": "off"
      }
    ],
*/
export async function getLightState() {
    const res = await fetch('/api/mqtt/light-state', {
        method: 'GET',
    });
    if (!res.ok) {
        throw new Error(`Get light state failed: ${res.statusText}`);
    }
    //extract the light state from the response from first light_report
    const data = await res.json();
    if (!data || !data.report || !data.report.lights_report) {
        throw new Error('Invalid light state response');
    }
    const lightState = data.report.lights_report[0].mode == 'on';
    return lightState;
}
  
