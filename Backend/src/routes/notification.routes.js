import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getAllNotifications,
  markAllAsRead,
  markNotificationAsRead,
  deleteNotification,
  createNotification
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllNotifications);
router.put("/read-all", isAuthenticated, markAllAsRead);
router.put("/:id/read", isAuthenticated, markNotificationAsRead);
router.delete("/:id", isAuthenticated, deleteNotification);

// (optional for testing)
router.post("/", isAuthenticated, createNotification);

export default router;
