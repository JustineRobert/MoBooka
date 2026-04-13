const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/profile', protect, asyncHandler(async (req, res) => {
  res.json(req.user);
}));

router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, phone, payoutProvider, payoutAccount } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (payoutProvider) user.payoutProvider = payoutProvider;
  if (payoutAccount) user.payoutAccount = payoutAccount;

  await user.save();
  res.json({ message: 'Profile updated', user });
}));

module.exports = router;
