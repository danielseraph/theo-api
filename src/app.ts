import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import logger, { stream } from './utils/logger';
import routes from './routes';
import { swaggerSpec } from './config/swagger';

const app = express();

// Trust proxy - required for rate limiting behind a proxy
app.set('trust proxy', 1);

// 1. helmet with sensible defaults
app.use(helmet());

// 2. cors
const allowedOrigins = [env.FRONTEND_URL];
if (env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
}
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// 3. Global rate limiter
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: env.RATE_LIMIT_MAX || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 4. express.json
app.use(express.json({ limit: '10kb' }));

// 5. express.urlencoded
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 6. morgan
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream }));

// 7. Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'community-website-api',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// 8. Swagger UI
if (env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// 9. Mount API router
app.use('/api/v1', routes);
app.use('/api', routes); // Alias for frontend convenience

// 10. 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// 11. Global errorHandler
app.use(errorHandler);

export default app;

