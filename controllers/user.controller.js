// controllers/user.controller.js
const User = require('../models/user.model');
const multer = require('multer');

// Get User Profile (User Only)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload Profile Photo (User Only)
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.photo = req.file.path; // Updated to use full path
    await user.save();

    res.status(200).json({ msg: 'Photo uploaded successfully', user });
  } catch (err) {
    console.error('Error in uploadPhoto:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadPhoto
};