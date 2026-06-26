import  { MatchRequest }  from "../models/matchRequest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { SkillOffer } from "../models/skillOffer.model.js";
import { User } from "../models/user.model.js";
import crypto from 'crypto';

// ─────────────────────────────────────────────────────────────
// 🟢 Create Swap Request
const sendSwapRequest = asyncHandler(async (req, res) => {
  const { receiverId, requestedSkill, message } = req.body;

  if (!receiverId || !requestedSkill) {
    throw new ApiError(400, "All fields are required for swap request");
  }

  // Prevent duplicate pending swap requests
  const existing = await MatchRequest.findOne({
    sender: req.user._id,
    receiver: receiverId,
    requestedSkill,
    requestType: "Swap",
    status: "Pending"
  });
  if (existing) {
    throw new ApiError(409, "A pending swap request for this skill already exists.");
  }

  const request = await MatchRequest.create({
    sender: req.user._id,
    receiver: receiverId,
    requestedSkill,
    message,
    requestType: "Swap"
  });

  return res
    .status(201)
    .json(new ApiResponse(201, request, "Swap request sent"));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Create Paid Learn Request
const sendPaidRequest = asyncHandler(async (req, res) => {
  const { receiverId, requestedSkill, message, priceAgreed, scheduledTime } = req.body;

  if (!receiverId || !requestedSkill || !priceAgreed) {
    throw new ApiError(400, "Receiver, skill, and price are required");
  }

  // Prevent duplicate pending learn requests
  const existing = await MatchRequest.findOne({
    sender: req.user._id,
    receiver: receiverId,
    requestedSkill,
    requestType: "Learn",
    status: "Pending"
  });
  if (existing) {
    throw new ApiError(409, "A pending learn request for this skill already exists.");
  }

  const request = await MatchRequest.create({
    sender: req.user._id,
    receiver: receiverId,
    requestedSkill,
    message,
    priceAgreed,
    scheduledTime,
    requestType: "Learn"
  });

  return res
    .status(201)
    .json(new ApiResponse(201, request, "Paid learning request sent"));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Get All Requests for Current User (Received)
const getAllRequestsForUser = asyncHandler(async (req, res) => {
  const requests = await MatchRequest.find({ receiver: req.user._id })
    .populate("sender", "username fullName avatar")
    .populate("receiver", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Requests received"));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Get All Sent Requests by Current User
const getSentRequests = asyncHandler(async (req, res) => {
  const requests = await MatchRequest.find({ sender: req.user._id })
    .populate("receiver", "username fullName avatar")
    .populate("sender", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Requests sent"));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Accept/Reject/Complete Request
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Pending", "Accepted", "Rejected"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status update");
  }

  const request = await MatchRequest.findById(id);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  // Only receiver can accept or reject
  if (request.receiver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only receiver can update the request status");
  }

  request.status = status;
  await request.save();

  // If accepted and requestType is Swap, create reciprocal request if not exists
  if (status === "Accepted" && request.requestType === "Swap") {
    const reciprocal = await MatchRequest.findOne({
      sender: request.receiver,
      receiver: request.sender,
      requestedSkill: request.requestedSkill,
      requestType: "Swap",
      status: "Accepted"
    });
    if (!reciprocal) {
      await MatchRequest.create({
        sender: request.receiver,
        receiver: request.sender,
        requestedSkill: request.requestedSkill,
        message: request.message || "",
        requestType: "Swap",
        status: "Accepted"
      });
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request status updated"));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Cancel Request (only by sender before acceptance)
const cancelRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await MatchRequest.findById(id);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only sender can cancel this request");
  }

  if (request.status !== "Pending") {
    throw new ApiError(400, "Only pending requests can be cancelled");
  }

  await request.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Request cancelled successfully"));
});

// 🟢 Get Accepted Swap Partners
const getAcceptedSwapPartners = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const acceptedRequests = await MatchRequest.find({
    status: "Accepted",
    requestType: "Swap",
    $or: [
      { sender: userId },
      { receiver: userId }
    ]
  });

  // Get unique partner user IDs
  const partnerIds = acceptedRequests.map(r =>
    r.sender.toString() === userId.toString() ? r.receiver : r.sender
  );

  // Remove duplicates
  const uniquePartnerIds = [...new Set(partnerIds.map(id => id.toString()))];

  // Fetch user details
  const users = await User.find({ _id: { $in: uniquePartnerIds } }).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, users, "Accepted swap partners fetched"));
});

// 🟢 Get Accepted Learnings (swap partners + learn partners where user is sender)
const getAcceptedLearnings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // Swaps: all accepted swap partners (either direction)
  const swapRequests = await MatchRequest.find({
    status: "Accepted",
    requestType: "Swap",
    $or: [
      { sender: userId },
      { receiver: userId }
    ]
  });
  const swapPartnerIds = swapRequests.map(r =>
    r.sender.toString() === userId.toString() ? r.receiver : r.sender
  );

  // Learn: accepted learn requests where user is sender
  const learnRequests = await MatchRequest.find({
    status: "Accepted",
    requestType: "Learn",
    sender: userId
  });
  const learnPartnerIds = learnRequests.map(r => r.receiver);

  // Union and unique
  const allPartnerIds = [...swapPartnerIds, ...learnPartnerIds];
  const uniquePartnerIds = [...new Set(allPartnerIds.map(id => id.toString()))];

  const users = await User.find({ _id: { $in: uniquePartnerIds } }).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, users, "Accepted learnings fetched"));
});

// 🟢 Get Accepted Teachings (swap partners + learn partners where user is receiver)
const getAcceptedTeachings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // Swaps: all accepted swap partners (either direction)
  const swapRequests = await MatchRequest.find({
    status: "Accepted",
    requestType: "Swap",
    $or: [
      { sender: userId },
      { receiver: userId }
    ]
  });
  const swapPartnerIds = swapRequests.map(r =>
    r.sender.toString() === userId.toString() ? r.receiver : r.sender
  );

  // Learn: accepted learn requests where user is receiver
  const learnRequests = await MatchRequest.find({
    status: "Accepted",
    requestType: "Learn",
    receiver: userId
  });
  const learnPartnerIds = learnRequests.map(r => r.sender);

  // Union and unique
  const allPartnerIds = [...swapPartnerIds, ...learnPartnerIds];
  const uniquePartnerIds = [...new Set(allPartnerIds.map(id => id.toString()))];

  const users = await User.find({ _id: { $in: uniquePartnerIds } }).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, users, "Accepted teachings fetched"));
});

// 🟢 Get All Requests (Pending or Accepted) Between Two Users
const getRequestsBetween = asyncHandler(async (req, res) => {
  const { userA, userB } = req.body;
  if (!userA || !userB) {
    throw new ApiError(400, "Both userA and userB are required");
  }
  const requests = await MatchRequest.find({
    $or: [
      { sender: userA, receiver: userB },
      { sender: userB, receiver: userA }
    ],
    status: { $in: ["Pending", "Accepted"] }
  });
  return res.status(200).json(new ApiResponse(200, requests, "Requests between users fetched"));
});

export {
  sendSwapRequest,
  sendPaidRequest,
  getAllRequestsForUser,
  getSentRequests,
  updateRequestStatus,
  cancelRequest,
  getAcceptedSwapPartners,
  getAcceptedLearnings,
  getAcceptedTeachings,
  getRequestsBetween
};
