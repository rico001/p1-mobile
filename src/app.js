import express from 'express';
import mqttRoutes from './routes/mqttRoutes.js';
import ftpRoutes from './routes/ftpRoutes.js';
import thumbanailRoutes from './routes/thumbnailRoutes.js';


const app = express();
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });

app.use('/api/mqtt', mqttRoutes);
app.use('/api/ftp', ftpRoutes);
app.use('/api/thumbnail', thumbanailRoutes);

//public for thumbnails
app.use('/thumbnails', express.static('thumbnails'));
// a simple upload test
app.use('/upload', express.static('src/public/upload.html'));

export default app;
