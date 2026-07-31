import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import compression from 'compression';

import authRoutes from './routes/auth.routes';
import repoRoutes from './routes/repo.routes';
import userRoutes from './routes/user.routes';
import generateRoutes from './routes/generate.routes';
import profileRoutes from './routes/profile.routes';
import chatRoutes from './routes/chat.routes';
import healthRoutes from './routes/health.routes';
import changelogRoutes from './routes/changelog.routes';
import adminRoutes from './routes/admin.routes';
import { initCronJobs } from './utils/cron';
import { logger } from './utils/logger';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { contextMiddleware } from './middleware/context.middleware';

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Background Jobs
if (process.env.NODE_ENV !== 'test') {
  initCronJobs();
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(contextMiddleware);
app.use(
  pinoHttp({
    logger,
    genReqId: (req: any) => req.id,
    quietReqLogger: true,
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Localhost For Dev, Or Exactly Match The Production URL
      const allowedOrigins = ['http://localhost:5173', 'https://trywharf.vercel.app'];
      if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repo', repoRoutes);
app.use('/api/user', userRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/changelog', changelogRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic Route For API
app.get('/', (req, res) => {
  res.send('Wharf API is running...');
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server ready at: http://localhost:${PORT}`);
  });
}

export default app;
