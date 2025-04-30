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
