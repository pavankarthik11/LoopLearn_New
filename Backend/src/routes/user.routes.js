import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getUserByUsername,
  addSkillWanted,
  removeSkillWanted,
  getMyTeachings,
  getMyLearnings,
  getAllUsers,
  verifyEmail,
  verifyOtp,
  cleanupUnverifiedUsers,
  forgotPassword,
  resetPasswordWithOtp
} from "../controllers/user.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// ────────────────────────────────────────────────
// 🔐 Auth Routes
// Conditionally apply multer only for multipart/form-data (legacy file upload)
const conditionalUpload = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverImage", maxCount: 1 }
    ])(req, res, next);
  } else {
    next(); // JSON request — skip multer
  }
};
router.post("/register", conditionalUpload, registerUser);

router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.post("/refresh-token", refreshAccessToken);

// ────────────────────────────────────────────────
// 👤 User Profile & Settings
router.get("/me", isAuthenticated, getCurrentUser);
router.put("/update", isAuthenticated, updateAccountDetails);
router.put("/avatar", isAuthenticated, upload.single("avatar"), updateUserAvatar);
router.post("/change-password", isAuthenticated, changeCurrentPassword);

// ────────────────────────────────────────────────
// 📘 Skill Preferences
router.post("/skills-wanted", isAuthenticated, addSkillWanted);
router.delete("/skills-wanted", isAuthenticated, removeSkillWanted);

// ────────────────────────────────────────────────
// 📚 My Skills & Learning
router.get("/my-teachings", isAuthenticated, getMyTeachings);
router.get("/my-learnings", isAuthenticated, getMyLearnings);

// ────────────────────────────────────────────────
// 🔍 Public Profile
router.get("/profile/:username", getUserByUsername);

// Add this route for fetching all users
router.get("/", getAllUsers);
router.get('/verify-email', verifyEmail);
// Add this route for OTP verification
router.post('/verify-otp', verifyOtp);
// Add this route for cleaning up unverified users
router.delete('/cleanup-unverified', cleanupUnverifiedUsers);

// Add routes for forgot password and reset password with OTP
router.post('/forgot-password', forgotPassword);
router.post('/reset-password-otp', resetPasswordWithOtp);

export default router;
