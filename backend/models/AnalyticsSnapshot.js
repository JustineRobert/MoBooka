const mongoose = require('mongoose');

const AnalyticsSnapshotSchema = new mongoose.Schema({
  rangeStart: { type: Date, required: true },
  rangeEnd: { type: Date, required: true },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  revenueByBranch: [{
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    code: { type: String, trim: true },
    name: { type: String, trim: true },
    sales: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  }],
  demandByCategory: [{
    category: { type: String, trim: true },
    sales: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    forecast: { type: Number, default: 0 },
  }],
  topBooks: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    title: { type: String, trim: true },
    sales: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  }],
}, { timestamps: true });

module.exports = mongoose.model('AnalyticsSnapshot', AnalyticsSnapshotSchema);
