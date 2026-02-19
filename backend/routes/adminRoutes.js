import express from "express";
import  authMiddleware  from "../middleware/authMiddleware.js";
import  authorizeRoles  from "../middleware/roleMiddleware.js";
import {
  createOrganizerAdmin,
  getAllOrganizers,
  disableOrganizer,
  deleteOrganizer,
  resetOrganizerPassword,
  getPasswordResetRequests,
  getPendingResetRequests,
  approvePasswordReset,
  rejectPasswordReset
} from "../controllers/adminControllers.js";
import securityRoutes from "./securityRoutes.js";

const router = express.Router();

// All routes below are admin only
router.use(authMiddleware, authorizeRoles("admin"));

router.post("/organizers", createOrganizerAdmin);
router.get("/organizers", getAllOrganizers);
router.patch("/organizers/:id/disable", disableOrganizer);
router.patch("/organizers/:id/reset-password", resetOrganizerPassword);
router.delete("/organizers/:id", deleteOrganizer);

// Password Reset Request Routes (specific routes BEFORE generic routes)
router.get("/password-reset-requests/pending", getPendingResetRequests);
router.get("/password-reset-requests", getPasswordResetRequests);
router.patch("/password-reset-requests/:requestId/approve", approvePasswordReset);
router.patch("/password-reset-requests/:requestId/reject", rejectPasswordReset);

// Security monitoring routes
router.use("/security", securityRoutes);

export default router;
