const express = require('express');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const { initiatePayment, verifyPayment, providers } = require('../utils/mobileMoneyGateway');
const { verifySignature } = require('../utils/webhookValidator');
const asyncHandler = require('../utils/asyncHandler');

const generateReceiptNumber = () => `MB-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

const router = express.Router();

router.post('/initiate', protect, asyncHandler(async (req, res) => {
  const { bookId, provider, phone } = req.body;
  const book = await Book.findById(bookId).populate('author');
  if (!book || book.status !== 'published') {
    return res.status(404).json({ message: 'Book not available for purchase' });
  }
  if (book.price <= 0) {
    return res.status(400).json({ message: 'This book is free to download.' });
  }
  const existingPurchase = await Transaction.findOne({ book: book._id, buyer: req.user._id, status: 'success' });
  if (existingPurchase) {
    return res.status(409).json({ message: 'Book already purchased.' });
  }

  const reference = crypto.randomBytes(12).toString('hex');
  const payment = await initiatePayment({ provider, phone, amount: book.price, reference });
  const commissionPercent = Number(process.env.PLATFORM_COMMISSION_PERCENT || 15);
  const commission = (book.price * commissionPercent) / 100;
  const transaction = await Transaction.create({
    book: book._id,
    buyer: req.user._id,
    author: book.author._id,
    amount: book.price,
    commission,
    provider: provider.toLowerCase(),
    reference,
    receiptNumber: generateReceiptNumber(),
    paymentData: payment,
    status: payment.success ? 'pending' : 'failed',
  });

  if (!payment.success) {
    return res.status(502).json({ message: 'Payment provider error', payment });
  }

  res.status(201).json({ message: 'Payment initiated', reference, transactionId: transaction._id, payment });
}));

router.post('/verify', protect, asyncHandler(async (req, res) => {
  const { reference } = req.body;
  const transaction = await Transaction.findOne({ reference }).populate('book author buyer');
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
  if (transaction.status === 'success') {
    return res.json({ message: 'Payment already confirmed', transaction });
  }

  const verification = await verifyPayment({ provider: transaction.provider, reference });
  transaction.status = verification.status;
  transaction.paymentData = verification;
  if (verification.status === 'success') {
    transaction.paidAt = new Date();
    transaction.downloadToken = transaction.downloadToken || crypto.randomBytes(24).toString('hex');
    transaction.receiptNumber = transaction.receiptNumber || generateReceiptNumber();
    transaction.book.sales += 1;
    transaction.book.downloads += 1;
    transaction.book.earnings += transaction.amount - transaction.commission;
    await transaction.book.save();
  }
  await transaction.save();
  res.json({ verification, transaction });
}));

router.get('/providers', protect, asyncHandler(async (req, res) => {
  const available = Object.entries(providers).map(([key, provider]) => ({
    key,
    name: provider.name,
    configured: Boolean(provider.config.apiUrl && provider.config.apiKey),
  }));
  res.json({ providers: available });
}));

router.post('/webhook', asyncHandler(async (req, res) => {
  const { provider, reference, status, amount } = req.body;
  if (!provider || !reference || !status) {
    return res.status(400).json({ message: 'Invalid webhook payload' });
  }

  const secretKey = provider.toLowerCase() === 'mtn'
    ? process.env.MTN_MOMO_WEBHOOK_SECRET
    : provider.toLowerCase() === 'airtel'
      ? process.env.AIRTEL_MONEY_WEBHOOK_SECRET
      : null;
  const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'];
  const payload = req.rawBody || JSON.stringify(req.body);

  if (!verifySignature(payload, secretKey, signature)) {
    return res.status(401).json({ message: 'Webhook signature validation failed' });
  }

  const transaction = await Transaction.findOne({ reference }).populate('book');
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  if (transaction.status === 'success') {
    return res.json({ message: 'Transaction already confirmed' });
  }

  transaction.status = status.toLowerCase() === 'success' ? 'success' : status.toLowerCase() === 'failed' ? 'failed' : transaction.status;
  if (transaction.status === 'success') {
    transaction.paidAt = new Date();
    transaction.downloadToken = transaction.downloadToken || crypto.randomBytes(24).toString('hex');    transaction.receiptNumber = transaction.receiptNumber || generateReceiptNumber();
    transaction.paymentData = { provider, status, amount };    transaction.book.sales += 1;
    transaction.book.downloads += 1;
    transaction.book.earnings += transaction.amount - transaction.commission;
    await transaction.book.save();
  }
  await transaction.save();

  res.json({ success: true, transaction });
}));

router.get('/download/:bookId', protect, asyncHandler(async (req, res) => {
  const { token } = req.query;
  const { bookId } = req.params;
  const transaction = await Transaction.findOne({ book: bookId, buyer: req.user._id, downloadToken: token, status: 'success' }).populate('book');
  if (!transaction) return res.status(403).json({ message: 'Download access denied' });
  const book = transaction.book;
  res.json({ message: 'Download ready', fileUrl: book.fileUrl, title: book.title });
}));

module.exports = router;
