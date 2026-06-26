import { Review } from "../models/review.model.js";
import { SkillOffer } from "../models/skillOffer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────
// 🟢 Add a Review to a Skill
const createReview = asyncHandler(async (req, res) => {
  const { skillOfferId, rating, comment } = req.body;

  if (!skillOfferId || !rating) {
    throw new ApiError(400, "Skill ID and rating are required");
  }

  // Prevent multiple reviews by same user for same skill
  const alreadyReviewed = await Review.findOne({
    skillOffer: skillOfferId,
    reviewer: req.user._id
  });

  if (alreadyReviewed) {
    throw new ApiError(409, "You have already reviewed this skill");
  }

  const review = await Review.create({
    skillOffer: skillOfferId,
    reviewer: req.user._id,
    rating,
    comment
  });

  // Update average rating and count
  const reviews = await Review.find({ skillOffer: skillOfferId });

  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  await SkillOffer.findByIdAndUpdate(skillOfferId, {
    averageRating: avgRating,
    reviewCount: reviews.length
  });

  // Also update the user's averageRating and reviewCount
  const skill = await SkillOffer.findById(skillOfferId);
  if (skill) {
    // Find all skills for this user
    const allSkills = await SkillOffer.find({ user: skill.user });
    // Get all reviews for all skills
    const allReviews = await Review.find({ skillOffer: { $in: allSkills.map(s => s._id) } });
    const userAvg = allReviews.length > 0
      ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
      : 0;
    const { User } = await import('../models/user.model.js');
    await User.findByIdAndUpdate(skill.user, {
      averageRating: userAvg,
      reviewCount: allReviews.length
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, review, "Review submitted"));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Get All Reviews for a Skill
const getReviewsForSkill = asyncHandler(async (req, res) => {
  const { skillOfferId } = req.params;

  const reviews = await Review.find({ skillOffer: skillOfferId })
    .populate("reviewer", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "Reviews fetched"));
});

// ─────────────────────────────────────────────────────────────
// 🟢 Delete a Review (user can delete their own)
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.reviewer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this review");
  }

  const skillId = review.skillOffer;
  await review.deleteOne();

  // Recalculate rating
  const reviews = await Review.find({ skillOffer: skillId });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  await SkillOffer.findByIdAndUpdate(skillId, {
    averageRating: avgRating,
    reviewCount: reviews.length
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review deleted successfully"));
});

export { createReview, getReviewsForSkill, deleteReview };
