import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createTransaction,
  updateTransactionStatus,
  getUserTransactions,
  getTransactionById,
  requestPayment,
  submitUpiId,
  getPaymentQr
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createTransaction);
router.put("/:id/status", isAuthenticated, updateTransactionStatus);
router.get("/", isAuthenticated, getUserTransactions);
router.get("/:id", isAuthenticated, getTransactionById);

// Payment flow
router.post("/request-payment", isAuthenticated, requestPayment);
router.post("/submit-upi", isAuthenticated, submitUpiId);
router.get("/qr/:requestId", isAuthenticated, getPaymentQr);

export default router;
