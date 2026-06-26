// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Not authorized, token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!req.user) throw new ApiError(401, "Unauthorized, user not found");
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
});
