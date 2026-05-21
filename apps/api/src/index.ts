import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http';
import morgan from 'morgan';
import { globalLimiter } from './middlewares/rateLimiter';
import { logger } from './services/logger';
import authRouter from './controllers/auth.controller';
import { usersRouter } from './routes/users';
import { coursesRouter } from './routes/courses';
import friendsRouter from './routes/friends';
import adminRouter from './routes/admin';
import { initSocket } from './socket';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Trust proxy if running behind Nginx/load balancer (needed for accurate IP rate limiting)
app.set('trust proxy', 1);

// HTTP request logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Global rate limiting
app.use(globalLimiter);

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const isLocal =
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
        /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin);
      if (isLocal || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false); // Do not crash the server, just reject CORS
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/admin', adminRouter);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
  logger.info(`[server]: API running at http://localhost:${port}`);
});
