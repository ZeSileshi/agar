import { Server as SocketIOServer } from 'socket.io';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import type { AuthPayload } from '../middleware/auth.js';

const onlineUsers = new Map<string, string>(); // userId -> socketId

export function initWebSocket(server: Server) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: config.CORS_ORIGINS,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as AuthPayload;
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    onlineUsers.set(userId, socket.id);

    logger.debug({ userId }, 'User connected to WebSocket');

    // Notify contacts that user is online
    socket.broadcast.emit('user:online', { userId });

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle new message
    socket.on('message:send', async (data: {
      matchId: string;
      content: string;
      type?: string;
    }) => {
      // Emit to match room
      io.to(`match:${data.matchId}`).emit('message:new', {
        matchId: data.matchId,
        senderId: userId,
        content: data.content,
        type: data.type || 'text',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle typing indicator
    socket.on('message:typing', (data: { matchId: string; isTyping: boolean }) => {
      socket.to(`match:${data.matchId}`).emit('message:typing', {
        userId,
        matchId: data.matchId,
        isTyping: data.isTyping,
      });
    });

    // Handle message read
    socket.on('message:read', (data: { matchId: string; messageId: string }) => {
      io.to(`match:${data.matchId}`).emit('message:read', {
        userId,
        matchId: data.matchId,
        messageId: data.messageId,
      });
    });

    // Join match rooms
    socket.on('match:join', (matchId: string) => {
      socket.join(`match:${matchId}`);
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit('user:offline', { userId });
      logger.debug({ userId }, 'User disconnected from WebSocket');
    });
  });

  return io;
}
