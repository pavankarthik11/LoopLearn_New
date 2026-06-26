// models/transaction.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const transactionSchema = new Schema({
  payer: { type: Schema.Types.ObjectId, ref: 'User' },
  payee: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  relatedRequest: { type: Schema.Types.ObjectId, ref: 'MatchRequest' },
  status: { type: String, enum: ['initiated', 'success', 'failed'], default: 'initiated' }
}, { timestamps: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);
