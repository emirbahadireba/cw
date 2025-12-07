import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { startScheduleStatusUpdater } from './services/scheduleStatus.js';
import { startDisplayMonitor } from './services/displayMonitor.js';
import { autoUpdateUsageTracking } from './services/usageTracking.js';
import logger from './utils/logger.js';
import { requestLogger } from './middleware/requestLogger.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import displayRoutes from './routes/displays.js';
import mediaRoutes from './routes/media.js';
import layoutRoutes from './routes/layouts.js';
import playlistRoutes from './routes/playlists.js';
import scheduleRoutes from './routes/schedules.js';
import analyticsRoutes from './routes/analytics.js';
import applicationRoutes from './routes/applications.js';
import settingsRoutes from './routes/settings.js';
import notificationRoutes from './routes/notifications.js';
import planRoutes from './routes/plans.js';
import playerRoutes from './routes/player.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const pool = (await import('./config/database.js')).default;
    await pool.query('SELECT 1');
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/displays', displayRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/layouts', layoutRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/player', playerRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;

async function startServer() {
  // Test database connection before starting
  const dbModule = await import('./config/database.js');
  const dbConnected = await dbModule.testConnection();
  if (!dbConnected) {
    logger.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }
  
  // Start scheduled tasks
  startScheduleStatusUpdater();
  startDisplayMonitor();
  // Update usage tracking daily at midnight
  setInterval(autoUpdateUsageTracking, 24 * 60 * 60 * 1000);
  
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;

