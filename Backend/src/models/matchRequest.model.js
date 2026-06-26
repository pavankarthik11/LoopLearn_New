// models/MatchRequest.js

import mongoose from "mongoose";

const matchRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requestedSkill: {
    type: String,
    required: true,
  },
  requestType: {
    type: String, // "Swap" or "Learn"
    enum: ["Swap", "Learn"],
    required: true,
  },
  status: {
    type: String, // "Pending", "Accepted", "Rejected"
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String, // 'NotStarted', 'Requested', 'UPIProvided', 'Paid'
    enum: ['NotStarted', 'Requested', 'UPIProvided', 'Paid'],
    default: 'NotStarted',
  },
  upiId: {
    type: String,
    default: '',
  },
  qrCode: {
    type: String, // Store QR code as a data URL or image path
    default: '',
  },
});

export const MatchRequest = mongoose.model("MatchRequest", matchRequestSchema);
