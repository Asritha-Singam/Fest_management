import express from 'express';
import {registerForEvent,getMyEvents} from '../controllers/participantControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
const router = express.Router();
router.post(
    "/register/:eventId",
    authMiddleware,
    roleMiddleware("participant"),
    registerForEvent
);
router.get(
  "/my-events",
  authMiddleware,
  roleMiddleware("participant"),
  getMyEvents
);
export default router;