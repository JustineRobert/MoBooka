const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'author', 'reader'], default: 'reader' },
  emailVerified: { type: Boolean, default: false },
  payoutProvider: { type: String, enum: ['mtn', 'airtel', 'bank', ''] , default: ''},
  payoutAccount: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
