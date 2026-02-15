import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { createEvent, getEventParticipants, getOrganizerEvents, publishEvent, getEventAnalytics, exportParticipantsCSV, updateEvent } from "../controllers/eventControllers.js"; 
import { getOrganizerProfile, updateOrganizerProfile } from "../controllers/organizerControllers.js";
const router = express.Router();

//protect all organizer routes
router.use(authMiddleware, authorizeRoles("organizer"));

// Create event (POST /api/organizer/events/create)
router.post("/events/create", createEvent);

//get all events created by the organizer (GET /api/organizer/events OR /api/organizer/my-events)
router.get("/events", getOrganizerEvents);
router.get("/my-events", getOrganizerEvents);

//update event (PATCH /api/organizer/events/:eventId)
router.patch("/events/:eventId", updateEvent);

//publish event (POST /api/organizer/events/:eventId/publish)
router.post("/events/:eventId/publish", publishEvent);

//get event participants (GET /api/organizer/events/:eventId/participants)
router.get("/events/:eventId/participants", getEventParticipants);

//get event analytics (GET /api/organizer/events/:eventId/analytics)
router.get("/events/:eventId/analytics", getEventAnalytics);

//export event data as CSV (GET /api/organizer/events/:eventId/export)
router.get("/events/:eventId/export", exportParticipantsCSV);

//get organizer profile (GET /api/organizer/profile)
router.get("/profile", getOrganizerProfile);

//update organizer profile (PUT /api/organizer/profile)
router.put("/profile", updateOrganizerProfile);
export default router;