import mqttService from '../services/mqttService.js';

export async function printFile3mf(req, res, next) {
  try {
    const sequence_id = `print-file-3mf__${Date.now()}`;
    const payload = { print: { sequence_id, /* ... */ } };
    await mqttService.publish(mqttService.topics.request, payload);
    res.json({ message: 'Print File Request gesendet', sequence_id });
  } catch (err) {
    next(err);
  }
}

export async function getAccessCode(req, res, next) {
  try {
    console.log('→ getAccessCode gestartet');
    const sequence_id = `access-code__${Date.now()}`;
    const payload = { system: { sequence_id, command: 'get_access_code' } };
    await mqttService.publish(mqttService.topics.request, payload);
    res.json({ message: 'Access Code Request gesendet', sequence_id });
  } catch (err) {
    next(err);
  }
}
