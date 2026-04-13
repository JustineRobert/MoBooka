const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { check } = require('express-validator');
const User = require('../models/User');
const { sendEmail } = require('../utils/notifications');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

router.post(
  '/register',
  [
    check('name').trim().notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Valid email required'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    check('phone').optional().isMobilePhone('any').withMessage('Phone number must be valid'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, phone });
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
  })
);

router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Valid email required'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  })
);

router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json(req.user);
}));

module.exports = router;
