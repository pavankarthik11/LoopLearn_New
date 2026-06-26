import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
// Remove Resend import
dotenv.config();

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
    
}

// Helper to send email using EmailJS (HTTP API - bypasses Render SMTP blocks and guarantees Gmail deliverability)
const sendEmail = async ({ to, subject, text, html }) => {
    console.log("Attempting to send email via EmailJS to:", to);
    
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
        console.error("EmailJS credentials missing from environment variables!");
        throw new Error("EmailJS is not configured properly");
    }

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                template_params: {
                    to_email: to,
                    subject: subject,
                    message: text,
                    html_content: html || `<p>${text.replace(/\\n/g, '<br/>')}</p>`
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("EmailJS API Error:", errorText);
            throw new Error(errorText || 'Failed to send via EmailJS');
        }

        console.log("Email sent successfully via EmailJS.");
        return true;
    } catch (err) {
        console.error("Failed to send email via EmailJS:", err.message);
        throw err;
    }
};

const registerUser = asyncHandler( async (req, res) => {
    console.log("[REGISTER] Start");

    const {fullName, email, username, password, phone, avatarUrl} = req.body
    console.log("[REGISTER] Fields received:", { fullName, email, username, phone, hasAvatarUrl: !!avatarUrl });

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    
    console.log("[REGISTER] Checking existing user...");
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        if (!existedUser.isVerified) {
            console.log("[REGISTER] Unverified user exists, resending verification...");
            // Generate new verification token and OTP
            const token = crypto.randomBytes(32).toString('hex');
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            existedUser.emailVerificationToken = token;
            existedUser.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            existedUser.otp = otp;
            existedUser.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
            await existedUser.save();
            // Send verification link and OTP via nodemailer (Gmail) — fire and forget
            const verificationUrl = `${process.env.BASE_URL || 'http://localhost:8000'}/api/users/verify-email?token=${token}`;
            sendEmail({
              to: existedUser.email,
              subject: 'Verify your email',
              text: `Click the following link to verify your email: ${verificationUrl}\nOr enter this code: ${otp}`,
              html: `<p>Hello ${existedUser.fullName},</p><p>Click <a href="${verificationUrl}">here</a> to verify your email.<br/>Or enter this code: <b>${otp}</b> in the verification page.</p>`
            }).catch(err => console.error('[REGISTER] Resend email failed:', err.message));
            return res.status(200).json({ message: "Account exists but not verified. Verification link and code re-sent." });
        }
        throw new ApiError(409, "User with email or username already exists");
    }

    // Determine avatar URL — either from direct Cloudinary upload (avatarUrl) or from file upload (legacy)
    let finalAvatarUrl = avatarUrl;

    if (!finalAvatarUrl) {
        // Fallback: file upload via multer + Cloudinary (legacy path)
        let avatarLocalPath;
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0].path;
        }

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required");
        }

        console.log("[REGISTER] Uploading avatar to Cloudinary (legacy path)...");
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            throw new ApiError(400, "Avatar upload failed");
        }
        finalAvatarUrl = avatar.url;
    }
    console.log("[REGISTER] Avatar URL ready:", finalAvatarUrl?.substring(0, 50) + '...');

    // Handle cover image if provided via file upload
    let coverImageUrl = "";
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        const coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
        coverImageUrl = coverImage?.url || "";
    }

    console.log("[REGISTER] Creating user in DB...");
    const user = await User.create({
        fullName,
        avatar: finalAvatarUrl,
        coverImage: coverImageUrl,
        email,
        phone,
        password,
        username: username.toLowerCase()
    })
    console.log("[REGISTER] User created, generating verification...");

    // Generate verification token and OTP for email verification
    const token = crypto.randomBytes(32).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.isVerified = false;
    await user.save();

    console.log("[REGISTER] Sending verification email (fire-and-forget)...");
    // Send verification link and OTP via nodemailer (Gmail) — fire and forget, don't block response
    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:8000'}/api/users/verify-email?token=${token}`;
    sendEmail({
      to: user.email,
      subject: 'Verify your email',
      text: `Click the following link to verify your email: ${verificationUrl}\nOr enter this code: ${otp}`,
      html: `<p>Hello ${user.fullName},</p><p>Click <a href="${verificationUrl}">here</a> to verify your email.<br/>Or enter this code: <b>${otp}</b> in the verification page.</p>`
    }).catch(err => console.error('[REGISTER] Email failed:', err.message));
    console.log("[REGISTER] Response being sent (email sending in background)");

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    console.log("[REGISTER] Success! Sending response.");
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )


} )


const loginUser = asyncHandler( async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie

    const {email, username, password} = req.body
    console.log(email);
    

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }
    
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In successfully"
        )
    )

} )

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

} )

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unanthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
} )

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body


    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

} )

const getCurrentUser = asyncHandler( async (req, res) => {
    const user = await User.findById(req.user._id).populate('skillsOffered');
    return res
    .status(200)
    .json(new ApiResponse(200, user, "current user fetched successfully"))
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, phone, location, bio, socialLinks } = req.body;

  // Build an update object dynamically
  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (location) updateData.location = location;
  if (bio) updateData.bio = bio;
  if (socialLinks) updateData.socialLinks = socialLinks;

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No data provided to update");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});


const updateUserAvatar = asyncHandler( async (req, res) => {

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate
    (
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(200, user, "Avatar updated successfully")

} )

const getUserByUsername = asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ username })
        .select("-password -refreshToken")
        .populate("skillsOffered");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "User profile fetched"));
});

const addSkillWanted = asyncHandler(async (req, res) => {
    const { skill } = req.body;

    if (!skill) throw new ApiError(400, "Skill is required");

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { skillsWanted: skill } },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Skill added to wanted list"));
});

const removeSkillWanted = asyncHandler(async (req, res) => {
    const { skill } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { skillsWanted: skill } },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Skill removed from wanted list"));
});

// Could be in SkillOffer or User Controller
const getMyTeachings = asyncHandler(async (req, res) => {
    const skills = await SkillOffer.find({ user: req.user._id });

    return res.status(200).json(new ApiResponse(200, skills, "Your teaching skills fetched"));
});

// Could be in MatchRequest or User Controller
const getMyLearnings = asyncHandler(async (req, res) => {
    const requests = await MatchRequest.find({ sender: req.user._id, status: 'accepted' })
        .populate("receiverSkill");

    return res.status(200).json(new ApiResponse(200, requests, "Your learning sessions fetched"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken").populate("skillsOffered");
  return res.status(200).json(new ApiResponse(200, users, "All users fetched successfully"));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  res.json({ message: 'Email verified successfully' });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!user.otp || !user.otpExpiry || user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();
  // Send OTP via nodemailer (Gmail) — fire and forget
  sendEmail({
    to: user.email,
    subject: 'Your Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}`,
  }).catch(err => console.error('[FORGOT_PASSWORD] Email failed:', err.message));
  res.json({ message: 'OTP sent to your email.' });
});

export const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!user.otp || !user.otpExpiry || user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  user.password = newPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();
  res.json({ message: 'Password reset successfully' });
});

export const cleanupUnverifiedUsers = asyncHandler(async (req, res) => {
  const now = Date.now();
  const result = await User.deleteMany({
    isVerified: false,
    otpExpiry: { $lt: now }
  });
  res.json({ message: 'Cleanup complete', deletedCount: result.deletedCount });
});

export { 
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
    getAllUsers
 }
