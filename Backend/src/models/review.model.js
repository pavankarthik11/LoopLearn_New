// models/review.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const reviewSchema = new Schema({
  skillOffer: { type: Schema.Types.ObjectId, ref: 'SkillOffer', required: true },
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 500 }
}, { timestamps: true });

export const Review = mongoose.model('Review', reviewSchema);
