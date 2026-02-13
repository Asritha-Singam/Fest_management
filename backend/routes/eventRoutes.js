import express from 'express';
import {createEvent} from '../controllers/eventControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';
import { getAllEvents } from '../controllers/eventControllers.js';
const router = express.Router();

// Create event - only for organizers
router.post("/create", authMiddleware, authorizeRoles("organizer"), createEvent);
router.get("/all", getAllEvents);

export default router;