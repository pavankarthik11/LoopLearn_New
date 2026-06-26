import mongoose from 'mongoose';
const { Schema } = mongoose;

const skillOfferSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  skillName: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 500 },
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    default: 'intermediate'
  },
  hourlyRate: { type: Number, required: true, min: 0 },
  highlights: [{
    type: {
      type: String,
      enum: ['image', 'video', 'project', 'link'],
      required: true
    },
    url: { type: String, required: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true }
  }]
}, { timestamps: true });

export const SkillOffer = mongoose.model('SkillOffer', skillOfferSchema);