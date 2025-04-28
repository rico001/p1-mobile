import app from './app.js';
import { config } from './config/index.js';
import mqttService from './services/mqttService.js';

mqttService.init();
app.listen(config.port, () =>
  console.log(`[Express] 🚀 Server läuft auf Port ${config.port}`)
);
