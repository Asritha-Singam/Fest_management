import express from 'express';
import { getAllEvents } from '../controllers/eventControllers.js';
const router = express.Router();

// Public route - Get all published events
router.get("/all", getAllEvents);

export default router;