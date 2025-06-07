import express, { Request, Response, NextFunction } from 'express';
import mqttRoutes from './routes/mqttRoutes';
import ftpRoutes from './routes/ftpRoutes';
import videoRoutes from './routes/videoRoutes';
import thumbnailRoutes from './routes/thumbnailRoutes';
import tasmotaRoutes from './routes/tasmotaRoutes';
import path from 'path';
import errorHandler from './middlewares/errorHandler';

const app = express();

// Request-Body als JSON parsen
app.use(express.json());

// Logging-Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API-Routen
app.use('/api/mqtt', mqttRoutes);
app.use('/api/ftp', ftpRoutes);
app.use('/api/thumbnail', thumbnailRoutes);
app.use('/api/tasmota', tasmotaRoutes);
app.use('/api/video', videoRoutes);

// Statische Verzeichnisse
app.use('/thumbnails', express.static('thumbnails'));
app.use('/public', express.static('public'));

// Frontend ausliefern (SPA)
const frontendDist = path.join(process.cwd(), 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Fehlerbehandlung
app.use(
  errorHandler as (err: any, req: Request, res: Response, next: NextFunction) => void);

export default app;
