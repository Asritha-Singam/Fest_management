import express from 'express';
import { getAllEvents, getTrendingEvents, getEventsByOrganizerId } from '../controllers/eventControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();

// Public route - Get all published events
router.get("/all", getAllEvents);

// Get trending events (requires auth)
router.get("/trending", authMiddleware, getTrendingEvents);

// Get events by a specific organizer (includes completed) for participant view
router.get("/organizer/:organizerId", authMiddleware, getEventsByOrganizerId);

export default router;