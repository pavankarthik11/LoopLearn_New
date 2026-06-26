// models/notification.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const notificationSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String }, // e.g., match-request, payment, review
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  linkTo: { type: String }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
