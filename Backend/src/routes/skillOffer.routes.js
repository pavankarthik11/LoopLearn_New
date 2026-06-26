import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createSkillOffer,
  getAllSkillOffers,
  getSkillOfferById,
  updateSkillOffer,
  deleteSkillOffer,
  getSkillOffersByUser
} from "../controllers/skillOffer.controller.js";

const router = express.Router();

// All require auth except "getAllSkillOffers" and "getSkillOfferById"
router.post("/", isAuthenticated, createSkillOffer);
router.get("/", getAllSkillOffers);
router.get("/:id", getSkillOfferById);
router.put("/:id", isAuthenticated, updateSkillOffer);
router.delete("/:id", isAuthenticated, deleteSkillOffer);
router.get("/user/:userId", getSkillOffersByUser);

export default router;
