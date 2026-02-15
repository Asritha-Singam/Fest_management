import express from "express";
import  authMiddleware  from "../middleware/authMiddleware.js";
import  authorizeRoles  from "../middleware/roleMiddleware.js";
import {
  createOrganizerAdmin,
  getAllOrganizers,
  disableOrganizer,
  deleteOrganizer
} from "../controllers/adminControllers.js";

const router = express.Router();

// All routes below are admin only
router.use(authMiddleware, authorizeRoles("admin"));

router.post("/organizers", createOrganizerAdmin);
router.get("/organizers", getAllOrganizers);
router.patch("/organizers/:id/disable", disableOrganizer);
router.delete("/organizers/:id", deleteOrganizer);

export default router;
