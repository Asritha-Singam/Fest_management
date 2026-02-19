//load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authroutes.js';
import eventRoutes from './routes/eventRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { generalRateLimiter } from './middleware/securityMiddleware.js';

const app = express();

// Trust proxy - important for getting real IP addresses behind reverse proxies
app.set('trust proxy', 1);

// Configure CORS
app.use(cors({
  origin: function(origin, callback) {
    // Allow localhost on any port and no origin (mobile apps, curl requests)
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload size limit for image uploads (base64 encoded images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply general rate limiting to all routes
app.use(generalRateLimiter);

//import routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', forumRoutes);
app.use('/api/participants', participantRoutes);
//organizer
app.use('/api/organizer', organizerRoutes);
//admin
app.use('/api/admin', adminRoutes);
//payments
app.use('/api/payments', paymentRoutes);
export default app;