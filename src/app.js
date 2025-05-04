import express from 'express';
import mqttRoutes from './routes/mqttRoutes.js';
import ftpRoutes from './routes/ftpRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import thumbanailRoutes from './routes/thumbnailRoutes.js';
import tasmotaRoutes from './routes/tasmotaRoutes.js';
import path from 'path';
import errorHandler from './middlewares/errorHandler.js';


const app = express();
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });

app.use('/api/mqtt', mqttRoutes);
app.use('/api/ftp', ftpRoutes);
app.use('/api/thumbnail', thumbanailRoutes);
app.use('/api/tasmota', tasmotaRoutes);
app.use('/api/video/', videoRoutes);


//public for thumbnails
app.use('/thumbnails', express.static('thumbnails'));
// serve all files in folder "public" as static files
app.use('/public', express.static('public'));

// Frontend
const frontendDist = path.join(process.cwd(), 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorHandler);

export default app;
