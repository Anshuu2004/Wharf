import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import repoRoutes from './routes/repo.routes';
import userRoutes from './routes/user.routes';
import generateRoutes from './routes/generate.routes';
import profileRoutes from './routes/profile.routes';
import chatRoutes from './routes/chat.routes';
import healthRoutes from './routes/health.routes';
import changelogRoutes from './routes/changelog.routes';
import { initCronJobs } from './utils/cron';

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Background Jobs
initCronJobs();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic Route For API
app.get('/', (req, res) => {
  res.send('Wharf API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server ready at: http://localhost:${PORT}`);
});
