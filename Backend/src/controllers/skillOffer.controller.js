import { SkillOffer } from "../models/skillOffer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new skill offer
const createSkillOffer = asyncHandler(async (req, res) => {
  console.log('DEBUG req.user:', req.user); // Debug line
  const { skillName, description, experienceLevel, hourlyRate, highlights } = req.body;

  if (!skillName || !hourlyRate) {
    throw new ApiError(400, "Skill name and hourly rate are required");
  }

  const skillOffer = await SkillOffer.create({
    user: req.user._id,
    skillName,
    description,
    experienceLevel,
    hourlyRate,
    highlights
  });

  // Add the new skill's ObjectId to the user's skillsOffered array
  const { User } = await import("../models/user.model.js");
  const updateResult = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { skillsOffered: skillOffer._id } },
    { new: true }
  );
  console.log('DEBUG user update result:', updateResult);

  return res.status(201).json(
    new ApiResponse(201, skillOffer, "Skill offer created successfully")
  );
});

// Get all skill offers (Explore page)
const getAllSkillOffers = asyncHandler(async (req, res) => {
  const skills = await SkillOffer.find()
    .populate("user", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, skills, "All skills fetched"));
});

// Get one skill offer by ID (for details view)
const getSkillOfferById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const skill = await SkillOffer.findById(id).populate("user", "username fullName avatar");

  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  return res.status(200).json(new ApiResponse(200, skill, "Skill details fetched"));
});

// Update a skill offer (only by the owner)
const updateSkillOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const skill = await SkillOffer.findById(id);

  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  if (skill.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to edit this skill");
  }

  const updatedData = req.body;

  const updatedSkill = await SkillOffer.findByIdAndUpdate(id, updatedData, {
    new: true
  });

  return res.status(200).json(new ApiResponse(200, updatedSkill, "Skill updated"));
});

// Delete a skill offer (only by the owner)
const deleteSkillOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const skill = await SkillOffer.findById(id);

  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  if (skill.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this skill");
  }

  await skill.deleteOne();

  return res.status(200).json(new ApiResponse(200, {}, "Skill deleted successfully"));
});

// Get skill offers by a specific user
const getSkillOffersByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const skills = await SkillOffer.find({ user: userId });

  return res.status(200).json(new ApiResponse(200, skills, "User's skills fetched"));
});

export {
  createSkillOffer,
  getAllSkillOffers,
  getSkillOfferById,
  updateSkillOffer,
  deleteSkillOffer,
  getSkillOffersByUser
};
