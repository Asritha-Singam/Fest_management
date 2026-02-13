import express from "express";
import { registerParticipant, loginUser,createOrganizer } from "../controllers/authcontrollers.js";

const router = express.Router();

router.post("/register", registerParticipant);
router.post("/login", loginUser);
router.post("/createOrganizer", createOrganizer);

export default router;