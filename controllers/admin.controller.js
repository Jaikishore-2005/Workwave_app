// controllers/admin.controller.js
const Technician = require('../models/technician.model');
const Gig = require('../models/gig.model');
const User = require('../models/user.model');

// Verify Technician Document
const verifyTechnician = async (req, res) => {
  try {
    const technician = await Technician.findByIdAndUpdate(
      req.params.technicianId,
      { verified: true },
      { new: true }
    );
    if (!technician) return res.status(404).json({ msg: 'Technician not found' });
    res.status(200).json({ msg: 'Technician verified successfully', technician });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Unverified Technicians
const getUnverifiedTechnicians = async (req, res) => {
  try {
    const technicians = await Technician.find({ verified: false }).select('-password');
    res.status(200).json(technicians);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View All Gigs
const getAllGigs = async (req, res) => {
  try {
    const gigs = await Gig.find()
      .populate('userId', 'name')
      .populate('address'); // Removed category populate since it’s a string
    res.status(200).json(gigs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View All Users and Technicians
const getAllUsersAndTechnicians = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const technicians = await Technician.find().select('-password');
    res.status(200).json({ users, technicians });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Block or Approve User or Technician
const updateAccountStatus = async (req, res) => {
  const { role, status } = req.body;
  try {
    // Explicit admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admins only' });
    }

    if (!['user', 'technician'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role: Must be "user" or "technician"' });
    }
    if (!['active', 'locked'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status: Must be "active" or "locked"' });
    }

    let account;
    if (role === 'user') {
      account = await User.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).select('-password');
    } else if (role === 'technician') {
      account = await Technician.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).select('-password');
    }

    if (!account) return res.status(404).json({ msg: 'Account not found' });

    res.status(200).json({ msg: `${role} account ${status} successfully`, account });
  } catch (err) {
    console.error('Error in updateAccountStatus:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  verifyTechnician,
  getAllGigs,
  getAllUsersAndTechnicians,
  getUnverifiedTechnicians,
  updateAccountStatus
};