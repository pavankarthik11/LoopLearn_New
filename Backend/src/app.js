import dotenv from "dotenv";
dotenv.config(); // Load env variables
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ──────────────────────
// 🔐 Global Middlewares
const allowedOrigins = [
  process.env.CORS_ORIGIN,                // Production: https://loop-learn-five.vercel.app
  "http://localhost:5173",                  // Local dev
  "http://localhost:3000",                  // Local dev alt
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    // Allow exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow all Vercel preview deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ──────────────────────
// 📦 Route Imports
import userRoutes from "./routes/user.routes.js";
import skillRoutes from "./routes/skillOffer.routes.js";
import matchRequestRoutes from "./routes/matchRequest.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import mongoose from "mongoose";

// ──────────────────────
// 🏠 Health Check / Root (always works, even if DB is down)
app.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  res.status(200).json({
    success: true,
    message: "LoopLearn API is running",
    database: dbStatus[dbState] || "unknown",
    uptime: Math.floor(process.uptime()) + "s",
  });
});

// ──────────────────────
// 🛡️ Database connectivity check for API routes
app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable. Database is reconnecting. Please try again in a moment.",
    });
  }
  next();
});

// ──────────────────────
// 🔗 Route Mounting
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/match-requests", matchRequestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/transactions", transactionRoutes);

// ──────────────────────
// 🚨 Fallback

// 404 handler
app.use( (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});


export { app };
