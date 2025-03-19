// models/technician.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const TechnicianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  skillCategory: { type: String, required: true },
  verified: { type: Boolean, default: false },
  tools: { type: Boolean, required: true },
  rating: { type: Number, default: 0 }, // Average rating
  ratingCount: { type: Number, default: 0 }, // Number of ratings
  verificationDocument: { type: String, required: true },
  role: { type: String, default: 'technician' },
  createdAt: { type: Date, default: Date.now }
});

TechnicianSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('Technician', TechnicianSchema);