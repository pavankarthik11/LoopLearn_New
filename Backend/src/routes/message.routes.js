import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  sendMessage,
  getMessagesWithUser,
  markMessagesAsRead
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, sendMessage); // send a message
router.get("/:userId", isAuthenticated, getMessagesWithUser); // fetch chat with a user
router.put("/:userId/read", isAuthenticated, markMessagesAsRead); // mark read

export default router;
