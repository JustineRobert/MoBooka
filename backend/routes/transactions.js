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
    .sort({ createdAt: -1 });
  const totalRevenue = sales.reduce((sum, tx) => sum + tx.amount - tx.commission, 0);
  res.json({ sales, totalRevenue });
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
