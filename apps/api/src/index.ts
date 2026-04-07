import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import { authRouter } from './routes/auth.js';
import { userRouter } from './routes/users.js';
import { matchRouter } from './routes/matches.js';
import { discoveryRouter } from './routes/discovery.js';
import { chatRouter } from './routes/chat.js';
import { referralRouter } from './routes/referrals.js';
import { compatibilityRouter } from './routes/compatibility.js';
import { initWebSocket } from './websocket/index.js';

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'agar-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/matches', matchRouter);
app.use('/api/v1/discovery', discoveryRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/referrals', referralRouter);
app.use('/api/v1/compatibility', compatibilityRouter);

// Error handling
app.use(errorHandler);

// WebSocket
initWebSocket(server);

// Start server
server.listen(config.PORT, () => {
  logger.info(`Agar API running on port ${config.PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
});

export { app, server };
