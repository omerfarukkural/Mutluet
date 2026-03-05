import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import donationRoutes from './routes/donation.js';
import eventRoutes from './routes/event.js';
import matchingRoutes from './routes/matching.js';
import chatRoutes from './routes/chat.js';
import organizationRoutes from './routes/organization.js';
import wordpressRoutes from './routes/wordpress.js';
import oauthRoutes from './routes/oauth.js';
import { setupSocketIO } from './services/socket.js';
import { loadSecrets } from './config/azure-secrets.js';
import { setupMonitoring } from './config/monitoring.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/wordpress', wordpressRoutes);
app.use('/api/oauth', oauthRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO setup
setupSocketIO(io);

// Start server with async initialization
async function startServer() {
  try {
    // Setup monitoring (Application Insights)
    setupMonitoring();

    // Load secrets from Azure Key Vault (production only)
    if (process.env.NODE_ENV === 'production') {
      await loadSecrets();
    }

    const PORT = process.env.PORT || 3001;

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready`);
      console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
