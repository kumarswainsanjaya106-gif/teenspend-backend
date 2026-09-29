import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { errorHandler, NotFoundError } from './utils/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import recurringRoutes from './routes/recurringRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import insightRoutes from './routes/insightRoutes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  config.clientUrl
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Local development can use alternate dev-server ports. Production only
      // permits explicitly configured browser origins.
      return callback(null, !config.isProduction);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsing with safe size limits
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TeenSpend API is healthy and running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insights', insightRoutes);

// Catch-all 404 handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found.`));
});

// Centralized error handler
app.use(errorHandler);

export default app;
