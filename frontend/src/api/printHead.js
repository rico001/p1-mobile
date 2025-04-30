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
  