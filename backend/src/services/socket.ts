import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthSocket extends Socket {
  userId?: string;
}

export const setupSocketIO = (io: Server) => {
  // Authentication middleware
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Chat events
    socket.on('send_message', async (data) => {
      const { receiverId, content } = data;

      // Emit to receiver
      io.to(`user:${receiverId}`).emit('receive_message', {
        senderId: socket.userId,
        content,
        timestamp: new Date()
      });
    });

    // Typing indicator
    socket.on('typing_start', (data) => {
      const { receiverId } = data;
      io.to(`user:${receiverId}`).emit('user_typing', {
        userId: socket.userId
      });
    });

    socket.on('typing_stop', (data) => {
      const { receiverId } = data;
      io.to(`user:${receiverId}`).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Video call events
    socket.on('call_user', (data) => {
      const { receiverId, offer } = data;
      io.to(`user:${receiverId}`).emit('incoming_call', {
        callerId: socket.userId,
        offer
      });
    });

    socket.on('answer_call', (data) => {
      const { callerId, answer } = data;
      io.to(`user:${callerId}`).emit('call_answered', {
        answer
      });
    });

    socket.on('ice_candidate', (data) => {
      const { receiverId, candidate } = data;
      io.to(`user:${receiverId}`).emit('ice_candidate', {
        senderId: socket.userId,
        candidate
      });
    });

    socket.on('end_call', (data) => {
      const { receiverId } = data;
      io.to(`user:${receiverId}`).emit('call_ended', {
        userId: socket.userId
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
