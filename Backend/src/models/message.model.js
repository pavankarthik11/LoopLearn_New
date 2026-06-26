// models/message.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);
