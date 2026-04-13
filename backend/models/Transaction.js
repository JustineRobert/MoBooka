const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  commission: { type: Number, required: true },
  provider: { type: String, enum: ['mtn', 'airtel'], required: true },
  reference: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  paidAt: { type: Date },
  downloadToken: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
