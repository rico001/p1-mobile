import express from 'express';
import mqttRoutes from './routes/mqttRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
//import logger from './middlewares/logger.js';

const app = express();
//app.use(logger);
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
app.use('/api/mqtt', mqttRoutes);


export default app;
