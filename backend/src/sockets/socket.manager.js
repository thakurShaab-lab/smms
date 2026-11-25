import { Server } from 'socket.io';
import { eq } from 'drizzle-orm';
import { verifyAccessToken } from '../utils/jwt.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { db } from '../db/client.js';
import { studentParents } from '../db/schema/index.js';

let ioInstance = null;

async function joinParentToChildRooms(socket) {
  const links = await db.query.studentParents.findMany({
    where: eq(studentParents.parentId, socket.user.profileId)
  });
  for (const link of links) {
    socket.join(`student:${link.studentId}`);
  }
}

export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true
    }
  });

  ioInstance.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        next(new Error('Authentication token required'));
        return;
      }
      const payload = verifyAccessToken(token);
      socket.user = {
        id: payload.sub,
        role: payload.role,
        profileId: payload.profileId
      };
      next();
    } catch {
      next(new Error('Invalid or expired authentication token'));
    }
  });

  ioInstance.on('connection', (socket) => {
    logger.debug('Socket connected', { userId: socket.user.id, role: socket.user.role });

    if (socket.user.role === 'parent' && socket.user.profileId) {
      socket.join(`parent:${socket.user.profileId}`);
      joinParentToChildRooms(socket).catch((error) => {
        logger.error('Failed to join parent to child rooms', { userId: socket.user.id, error: error.message });
      });
    }
    if (socket.user.role === 'teacher' || socket.user.role === 'admin') {
      socket.join('staff');
    }

    socket.on('join:class', (classId) => {
      if (socket.user.role === 'teacher' || socket.user.role === 'admin') {
        socket.join(`class:${classId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected', { userId: socket.user.id });
    });
  });

  return ioInstance;
}

export function getIO() {
  if (!ioInstance) throw new Error('Socket.IO has not been initialized yet');
  return ioInstance;
}

export function emitMediaProcessed({ mediaId, mediaType, studentIds, classId }) {
  if (!ioInstance) return;
  const payload = { mediaId, mediaType, studentIds };

  ioInstance.to('staff').emit('media:processed', payload);
  if (classId) ioInstance.to(`class:${classId}`).emit('media:processed', payload);
  for (const studentId of studentIds || []) {
    ioInstance.to(`student:${studentId}`).emit('media:processed', payload);
  }
}

export function emitMediaFailed({ mediaId, mediaType, error }) {
  if (!ioInstance) return;
  ioInstance.to('staff').emit('media:failed', { mediaId, mediaType, error });
}
