import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────
// 🟢 Get All Notifications for Current User
const getAllNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, notifications, "Notifications fetched")
  );
});

// ─────────────────────────────────────────────────────────────
// 🟢 Mark All Notifications as Read
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications marked as read"));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Mark Single Notification as Read
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to mark this notification");
  }

  notification.isRead = true;
  await notification.save();

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read")
  );
});

// ─────────────────────────────────────────────────────────────
// 🟢 Delete Notification
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this notification");
  }

  await notification.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Notification deleted successfully"));
});

// (Optional) 🟢 Create a Notification (useful for testing or admin)
const createNotification = asyncHandler(async (req, res) => {
  const { recipient, type, message, linkTo } = req.body;

  if (!recipient || !message) {
    throw new ApiError(400, "Recipient and message are required");
  }

  const notification = await Notification.create({
    recipient,
    type,
    message,
    linkTo
  });

  return res
    .status(201)
    .json(new ApiResponse(201, notification, "Notification created"));
});

export {
  getAllNotifications,
  markAllAsRead,
  markNotificationAsRead,
  deleteNotification,
  createNotification
};
