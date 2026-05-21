import { Server, Socket } from 'socket.io';
import http from 'http';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { pvpManager } from './services/pvp.manager';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Map of userId -> Set of socketIds
export const onlineUsers = new Map<string, Set<string>>();

export function initSocket(server: http.Server) {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  const io = new Server(server, {
    cors: {
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
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      console.log('[SocketMiddleware] Connection attempt from:', socket.id);
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        console.warn('[SocketMiddleware] Connection failed: No cookies provided');
        return next(new Error('No cookies provided'));
      }
      const cookies = parse(cookieHeader);
      const token = cookies.token;
      if (!token) {
        console.warn('[SocketMiddleware] Connection failed: No auth token cookie found');
        return next(new Error('No auth token provided'));
      }
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.data.userId = decoded.userId;
      console.log(
        '[SocketMiddleware] Connection authenticated successfully for user:',
        decoded.userId,
      );
      next();
    } catch (err) {
      console.error('[SocketMiddleware] Connection auth failed:', err);
      return next(new Error('Auth failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    if (!userId) return;

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    console.log(`[Socket] User connected: ${userId} (Socket: ${socket.id})`);

    // Let the PvP manager know this socket is online
    pvpManager.handleConnection(socket, io);

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${userId} (Socket: ${socket.id})`);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
      pvpManager.handleDisconnect(socket, io);
    });
  });

  return io;
}
