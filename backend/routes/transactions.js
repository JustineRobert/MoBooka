const express = require('express');
const { protect } = require('../middleware/auth');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(protect);

router.get('/me', asyncHandler(async (req, res) => {
  const history = await Transaction.find({ buyer: req.user._id })
    .populate('book', 'title price coverUrl fileUrl')
    .sort({ createdAt: -1 });
  res.json({ history });
}));

router.get('/author/me', asyncHandler(async (req, res) => {
  const sales = await Transaction.find({ author: req.user._id, status: 'success' })
    .populate('book', 'title price')
    .populate('branch', 'name code')
    .sort({ createdAt: -1 });
  const totalRevenue = sales.reduce((sum, tx) => sum + tx.amount - tx.commission, 0);
  const branchSummary = sales.reduce((acc, tx) => {
    const key = tx.branch?.code || 'MAIN';
    acc[key] = (acc[key] || 0) + (tx.amount - tx.commission);
    return acc;
  }, {});
  res.json({ sales, totalRevenue, branchSummary });
}));

router.get('/forecast', asyncHandler(async (req, res) => {
  const periodStart = new Date();
  periodStart.setMonth(periodStart.getMonth() - 3);
  const sales = await Transaction.find({
    author: req.user._id,
    status: 'success',
    createdAt: { $gte: periodStart },
  }).populate('book', 'title category');

  const grouped = sales.reduce((acc, tx) => {
    const category = tx.book?.category || 'Uncategorized';
    if (!acc[category]) acc[category] = { count: 0, revenue: 0, amount: 0 };
    acc[category].count += 1;
    acc[category].revenue += tx.amount - tx.commission;
    acc[category].amount += tx.amount;
    return acc;
  }, {});

  const demandByCategory = Object.entries(grouped).map(([category, stats]) => ({
    category,
    sales: stats.count,
    revenue: stats.revenue,
    forecast: Math.round(stats.count * 1.15),
  }));

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, tx) => sum + tx.amount - tx.commission, 0);

  res.json({
    totalSales,
    totalRevenue,
    demandByCategory,
    forecastHint: `Forecast suggests ${Math.max(totalSales, 0)} sales next month based on recent trends.`,
  });
}));

router.get('/receipt/:id', asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('book', 'title category price coverUrl')
    .populate('buyer', 'name email phone')
    .populate('author', 'name email');

  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  const isOwner = transaction.buyer._id.equals(req.user._id) || transaction.author._id.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({ transaction });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('book', 'title category price coverUrl')
    .populate('buyer', 'name email phone')
    .populate('author', 'name email');

  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  const isOwner = transaction.buyer._id.equals(req.user._id) || transaction.author._id.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({ transaction });
}));

router.get('/download/:bookId', asyncHandler(async (req, res) => {
  const { token } = req.query;
  const { bookId } = req.params;
  const transaction = await Transaction.findOne({
    book: bookId,
    buyer: req.user._id,
    downloadToken: token,
    status: 'success',
  }).populate('book');
  if (!transaction) {
    return res.status(403).json({ message: 'Download access denied' });
  }
  res.json({ fileUrl: transaction.book.fileUrl, title: transaction.book.title });
}));

module.exports = router;
