// controllers/gig.controller.js
const Gig = require('../models/gig.model');
const Address = require('../models/address.model');
const User = require('../models/user.model');

// Post a New Gig (User Only)
const postGig = async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Uploaded File:', req.file);
  if (req.user.role !== 'user') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  const { title, description, category, address, date, time } = req.body;
  const images = req.file ? req.file.path : null;

  const allowedCategories = ['Electrical', 'Plumbing', 'Carpentry', 'Painting'];
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ msg: 'Invalid category' });
  }

  try {
    const addressExists = await Address.findOne({ _id: address, userId: req.user.userId });
    if (!addressExists) return res.status(400).json({ msg: 'Invalid address' });

    const newGig = new Gig({
      userId: req.user.userId,
      title,
      description,
      category,
      address,
      date,
      time,
      images
    });

    await newGig.save();
    res.status(201).json(newGig);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Gigs (Admin Panel Only)
const getAllGigs = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied' });
  }
  try {
    const gigs = await Gig.find().populate('userId', 'name').populate('address');
    res.status(200).json(gigs);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching Gigs: ' + err.message });
  }
};

// Get User Gigs (Admin Panel Only)
const getUserGigs = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied' });
  }
  try {
    const gigs = await Gig.find().populate('userId', 'name').populate('address');
    res.status(200).json(gigs);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching Gigs: ' + err.message });
  }
};

// Get Gigs by Category (Technician Only)
const getGigsByCategory = async (req, res) => {
  if (req.user.role !== 'technician') {
    return res.status(403).json({ msg: 'Access denied' });
  }
  try {
    console.log('Technician User:', JSON.stringify(req.user, null, 2));
    console.log('Querying Gigs with Category:', req.user.skillCategory);
    const gigs = await Gig.find({ category: req.user.skillCategory })
      .populate('userId', 'name')
      .populate('address');
    console.log('Found Gigs:', JSON.stringify(gigs, null, 2));
    console.log('All Gigs in DB:', await Gig.find({}).select('category'));
    console.log('Gigs with "Plumbing":', await Gig.find({ category: "Plumbing" }).select('category'));
    res.status(200).json(gigs);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get Gig Details (User and Technician Only)
const getGigDetails = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId).populate('userId', 'name').populate('address');
    if (!gig) return res.status(404).json({ msg: 'Gig not found' });
    if (req.user.role === 'user' && gig.userId._id.toString() === req.user.userId) {
      return res.status(200).json(gig);
    }
    if (req.user.role === 'technician' && gig.category === req.user.skillCategory) {
      return res.status(200).json(gig);
    }
    return res.status(403).json({ msg: 'Access denied: You do not have permission to view this Gig' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Gig (User Only)
const deleteGig = async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ msg: 'Access denied' });
  }
  try {
    const gig = await Gig.findOneAndDelete({ _id: req.params.gigId, userId: req.user.userId });
    if (!gig) return res.status(404).json({ msg: 'Gig not found' });
    res.status(200).json({ msg: 'Gig deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { postGig, getAllGigs, getUserGigs, getGigsByCategory, getGigDetails, deleteGig };