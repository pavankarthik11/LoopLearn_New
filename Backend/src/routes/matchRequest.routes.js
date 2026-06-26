import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  sendSwapRequest,
  sendPaidRequest,
  getAllRequestsForUser,
  getSentRequests,
  updateRequestStatus,
  cancelRequest,
  getAcceptedSwapPartners,
  getAcceptedLearnings,
  getAcceptedTeachings,
  getRequestsBetween,
} from "../controllers/matchRequest.controller.js";

const router = express.Router();

router.post("/swap", isAuthenticated, sendSwapRequest);
router.post("/paid", isAuthenticated, sendPaidRequest);
router.post("/requests-between", isAuthenticated, getRequestsBetween);

router.get("/received", isAuthenticated, getAllRequestsForUser);
router.get("/sent", isAuthenticated, getSentRequests);
router.get("/accepted-swap-partners", isAuthenticated, getAcceptedSwapPartners);
router.get("/accepted-learnings", isAuthenticated, getAcceptedLearnings);
router.get("/accepted-teachings", isAuthenticated, getAcceptedTeachings);

router.put("/:id/status", isAuthenticated, updateRequestStatus);
router.delete("/:id", isAuthenticated, cancelRequest);

export default router;
