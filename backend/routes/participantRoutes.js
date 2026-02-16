import express from 'express';
import {registerForEvent,getMyEvents, getProfile, getAllOrganizers, getRecommendedEvents, changePassword} from '../controllers/participantControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';
import { updateProfile } from '../controllers/participantControllers.js';
const router = express.Router();

// Protect all participant routes
router.use(authMiddleware, authorizeRoles("participant"));

router.post("/register/:eventId", registerForEvent);
router.get("/my-events", getMyEvents);
router.get("/recommended-events", getRecommendedEvents);
router.get("/profile", getProfile);
router.get("/organizers", getAllOrganizers);
router.put("/profile", updateProfile);
router.post("/change-password", changePassword);

export default router;