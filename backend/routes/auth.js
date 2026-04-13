const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/notifications');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  const user = await User.create({ name, email, password, phone, role });
  const verificationToken = crypto.randomBytes(20).toString('hex');
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your MoBooka account',
    text: `Verify your account: ${verifyUrl}`,
  }).catch(() => {});
  res.status(201).json({
    message: 'Registration successful. Please check your email to verify your account.',
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = generateToken(user._id);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}));

router.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Not authorized' });
    res.json(user);
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
}));

module.exports = router;
