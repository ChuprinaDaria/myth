import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import eventsRouter from './routes/events';
import notificationsRouter from './routes/notifications';
import adminRouter from './routes/admin';
import { startAllCronJobs } from './services/cronService';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Static files (для зображень)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Ukrainian Calendar API',
    version: '1.0.0',
    endpoints: {
      events: '/api/events',
      notifications: '/api/notifications',
      admin: '/api/admin',
      health: '/health'
    }
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log('='.repeat(50));

  // Запускаємо cron jobs (можна вимкнути через ENV)
  if (process.env.ENABLE_CRON !== 'false') {
    startAllCronJobs();
  } else {
    console.log('⏱️ Cron jobs are disabled by ENABLE_CRON=false');
  }
});

export default app;
