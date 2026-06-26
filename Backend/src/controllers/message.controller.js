import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// ─────────────────────────────────────────────────────────────
// 🟢 Send a Message
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content, type } = req.body;

  if (!receiverId || !content) {
    throw new ApiError(400, "Receiver and content are required");
  }

  const receiverExists = await User.findById(receiverId);
  if (!receiverExists) {
    throw new ApiError(404, "Receiver does not exist");
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    content,
    type: type || "text"
  });

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent successfully"));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Get Messages Between Logged In User and Another User
const getMessagesWithUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id }
    ]
  }).sort({ createdAt: 1 }); // chronological order

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched"));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Mark Messages as Read
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await Message.updateMany(
    {
      sender: userId,
      receiver: req.user._id,
      isRead: false
    },
    { $set: { isRead: true } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Messages marked as read"));
});

export {
  sendMessage,
  getMessagesWithUser,
  markMessagesAsRead
};
