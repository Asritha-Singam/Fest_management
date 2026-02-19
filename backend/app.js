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
import { generalRateLimiter } from './middleware/securityMiddleware.js';

const app = express();

// Trust proxy - important for getting real IP addresses behind reverse proxies
app.set('trust proxy', 1);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

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
export default app;