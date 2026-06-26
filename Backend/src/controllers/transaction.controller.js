import { Transaction } from "../models/transaction.model.js";
import { MatchRequest } from "../models/matchRequest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import QRCode from 'qrcode';

// ─────────────────────────────────────────────────────────────
// 🟢 Create Transaction (upon payment intent or confirmed session)
const createTransaction = asyncHandler(async (req, res) => {
  const { payeeId, amount, relatedRequestId } = req.body;

  if (!payeeId || !amount || !relatedRequestId) {
    throw new ApiError(400, "All fields are required");
  }

  const transaction = await Transaction.create({
    payer: req.user._id,
    payee: payeeId,
    amount,
    relatedRequest: relatedRequestId,
    status: "initiated"
  });

  return res.status(201).json(
    new ApiResponse(201, transaction, "Transaction initiated")
  );
});

// ─────────────────────────────────────────────────────────────
// 🟢 Update Transaction Status (e.g., success/failure)
const updateTransactionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["initiated", "success", "failed"].includes(status)) {
    throw new ApiError(400, "Invalid transaction status");
  }

  const transaction = await Transaction.findById(id);

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  transaction.status = status;
  await transaction.save();

  // Update MatchRequest paymentStatus accordingly
  if (status === "success") {
    await MatchRequest.findByIdAndUpdate(
      transaction.relatedRequest,
      { paymentStatus: "Paid" },
      { new: true }
    );
  } else if (status === "failed") {
    await MatchRequest.findByIdAndUpdate(
      transaction.relatedRequest,
      { paymentStatus: "Failed" },
      { new: true }
    );
  }

  return res.status(200).json(
    new ApiResponse(200, transaction, "Transaction updated")
  );
});

// 🟢 Learner initiates payment for accepted learn request
export const requestPayment = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const request = await MatchRequest.findById(requestId);
  if (!request || request.requestType !== 'Learn' || request.status !== 'Accepted') {
    throw new ApiError(400, 'Invalid or non-accepted learn request');
  }
  // Clear previous UPI and QR code on new payment request
  request.upiId = '';
  request.qrCode = '';
  request.paymentStatus = 'Requested';
  await request.save();
  return res.status(200).json(new ApiResponse(200, request, 'Payment requested'));
});

// 🟢 Teacher submits UPI ID for payment request
export const submitUpiId = asyncHandler(async (req, res) => {
  const { requestId, upiId } = req.body;
  const request = await MatchRequest.findById(requestId);
  if (!request || request.requestType !== 'Learn' || request.status !== 'Accepted') {
    throw new ApiError(400, 'Invalid or non-accepted learn request');
  }
  request.upiId = upiId;
  request.paymentStatus = 'UPIProvided';
  // Generate UPI QR code
  const amount = request.priceAgreed || 0;
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Teacher&am=${amount}&cu=INR`;
  request.qrCode = await QRCode.toDataURL(upiUrl);
  await request.save();
  return res.status(200).json(new ApiResponse(200, request, 'UPI ID submitted and QR generated'));
});

// 🟢 Learner fetches QR code for payment
export const getPaymentQr = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const request = await MatchRequest.findById(requestId);
  if (!request || !request.qrCode) {
    throw new ApiError(404, 'QR code not available');
  }
  return res.status(200).json(new ApiResponse(200, { qrCode: request.qrCode }, 'QR code fetched'));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Get All Transactions for Current User (as payer or payee)
const getUserTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    $or: [{ payer: req.user._id }, { payee: req.user._id }]
  })
    .populate("payee", "username fullName")
    .populate("payer", "username fullName")
    .populate("relatedRequest")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, transactions, "Transactions fetched"));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Get Single Transaction by ID
const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await Transaction.findById(id)
    .populate("payee", "username fullName")
    .populate("payer", "username fullName")
    .populate("relatedRequest");

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, transaction, "Transaction details fetched"));
});

export {
  createTransaction,
  updateTransactionStatus,
  getUserTransactions,
  getTransactionById
};
