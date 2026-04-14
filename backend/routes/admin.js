const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const Book = require('../models/Book');
const Branch = require('../models/Branch');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/reports', asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalBooks = await Book.countDocuments();
  const totalTransactions = await Transaction.find({ status: 'success' });
  const revenue = totalTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const commission = totalTransactions.reduce((sum, tx) => sum + tx.commission, 0);
  const topBooks = await Book.find({ status: 'published' }).sort({ sales: -1 }).limit(10);
  res.json({ totalUsers, totalBooks, revenue, commission, topBooks });
}));

router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
}));

router.get('/books', asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const books = await Book.find(filter)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .populate('author', 'name email');
  res.json({ count: books.length, books });
}));

router.get('/transactions', asyncHandler(async (req, res) => {
  const transactions = await Transaction.find().sort({ createdAt: -1 }).populate('book buyer author', 'title name email');
  res.json({ count: transactions.length, transactions });
}));

router.get('/branches', asyncHandler(async (req, res) => {
  const branches = await Branch.find().sort({ createdAt: -1 });
  res.json({ count: branches.length, branches });
}));

router.post(
  '/branches',
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('code').notEmpty().withMessage('Code is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, code, address, country, currency, taxRate, active } = req.body;
    const existing = await Branch.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ message: 'Branch code already exists' });
    }
    const branch = await Branch.create({
      name,
      code: code.toUpperCase(),
      address,
      country,
      currency,
      taxRate: Number(taxRate) || 0,
      active: active !== false,
    });
    res.status(201).json(branch);
  })
);

router.put(
  '/branches/:id',
  asyncHandler(async (req, res) => {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    Object.assign(branch, {
      name: req.body.name || branch.name,
      code: req.body.code ? req.body.code.toUpperCase() : branch.code,
      address: req.body.address || branch.address,
      country: req.body.country || branch.country,
      currency: req.body.currency || branch.currency,
      taxRate: req.body.taxRate !== undefined ? Number(req.body.taxRate) : branch.taxRate,
      active: req.body.active !== undefined ? Boolean(req.body.active) : branch.active,
    });
    await branch.save();
    res.json(branch);
  })
);

router.put(
  '/books/:id/status',
  [check('status').isIn(['draft', 'pending', 'published']).withMessage('Invalid status'), validate],
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    book.status = status;
    await book.save();
    res.json({ message: 'Book status updated', book });
  })
);

router.put(
  '/users/:id/role',
  [check('role').isIn(['admin', 'author', 'reader']).withMessage('Invalid role'), validate],
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ message: 'User role updated', user });
  })
);

module.exports = router;
