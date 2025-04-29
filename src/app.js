import express from 'express';
import mqttRoutes from './routes/mqttRoutes.js';
import ftpRoutes from './routes/ftpRoutes.js';


const app = express();
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });

app.use('/api/mqtt', mqttRoutes);
app.use('/api/ftp', ftpRoutes);
app.use('/thumbnails', express.static('thumbnails'));

export default app;
