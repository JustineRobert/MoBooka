const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  authors: [{ type: String, required: true, trim: true }],
  category: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  coverUrl: { type: String, trim: true },
  fileUrl: { type: String, trim: true },
  sampleUrl: { type: String, trim: true },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['draft', 'pending', 'published'], default: 'draft' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

BookSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' });

module.exports = mongoose.model('Book', BookSchema);
