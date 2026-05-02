import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import adminRoutes from './routes/admin.js';
import { setupSocketIO } from './services/socket.js';
import { loadSecrets } from './config/azure-secrets.js';
import { setupMonitoring } from './config/monitoring.js';

dotenv.config();

// Validate critical environment variables before starting
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET ortam değişkeni tanımlı değil. Uygulama başlatılamıyor.');
  process.exit(1);
}

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false, // required for Socket.IO
}));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS: Bu kaynaktan erişim izni yok'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body size limit (prevent request flood / DoS via large payloads)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global rate limiter (prevent general abuse)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek gönderdiniz, lütfen bir süre bekleyin.' },
});
app.use(globalLimiter);

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
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO setup
setupSocketIO(io);

// Start server with async initialization
async function startServer() {
  try {
    // Setup monitoring (Application Insights - opsiyonel)
    setupMonitoring();

    // Secret kontrolü (environment variables)
    await loadSecrets();

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
