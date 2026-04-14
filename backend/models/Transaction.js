const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  commission: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  posSale: { type: Boolean, default: false },
  offline: { type: Boolean, default: false },
  saleChannel: { type: String, trim: true, default: 'mobile' },
  provider: { type: String, enum: ['mtn', 'airtel', 'pos', 'offline'], required: true },
  reference: { type: String, required: true, unique: true },
  receiptNumber: { type: String, trim: true },
  paymentData: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  paidAt: { type: Date },
  downloadToken: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
