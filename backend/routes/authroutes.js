import express from "express";
import { registerParticipant, loginUser } from "../controllers/authcontrollers.js";
import { checkBlockedIP, loginRateLimiter, trackFailedLogin } from "../middleware/securityMiddleware.js";

const router = express.Router();

// Apply security middleware to login route
router.post("/login", checkBlockedIP, trackFailedLogin, loginRateLimiter, loginUser);

// Apply basic IP blocking to register route  
router.post("/register", checkBlockedIP, registerParticipant);

export default router;