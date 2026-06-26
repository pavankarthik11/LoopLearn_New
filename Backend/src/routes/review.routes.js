import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createReview,
  getReviewsForSkill,
  deleteReview
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createReview);
router.get("/:skillOfferId", getReviewsForSkill);
router.delete("/:id", isAuthenticated, deleteReview);

export default router;
