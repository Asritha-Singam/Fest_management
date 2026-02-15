import express from 'express';
import {registerForEvent,getMyEvents} from '../controllers/participantControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { updateProfile } from '../controllers/participantControllers.js';
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
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware("participant"),
  updateProfile
);
export default router;