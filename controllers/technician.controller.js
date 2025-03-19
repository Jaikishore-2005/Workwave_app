// controllers/technician.controller.js
const Technician = require('../models/technician.model');

// Get Technician Profile (Technician Only)
const getTechnicianProfile = async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.technicianId).select('-password');
    if (!technician) {
      return res.status(404).json({ msg: 'Technician not found' });
    }
    res.status(200).json(technician);
  } catch (err) {
    console.error('Error in getTechnicianProfile:', err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Update Profile (Technician Only)
const updateTechnicianProfile = async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Uploaded File:', req.file);
  const { name, phone, tools } = req.body; // Ensure lowercase 'name'
  const verificationDocument = req.file ? req.file.path : undefined;

  try {
    const technician = await Technician.findById(req.params.technicianId);
    if (!technician) {
      return res.status(404).json({ msg: 'Technician not found' });
    }
    if (technician._id.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Unauthorized: You can only update your own profile' });
    }

    // Update fields
    if (name) technician.name = name;
    if (phone) technician.phone = phone;
    if (tools !== undefined) technician.tools = tools === 'yes' || tools === 'true' || tools === true;
    if (verificationDocument) technician.verificationDocument = verificationDocument;

    await technician.save();

    res.status(200).json({ msg: 'Profile updated successfully', technician });
  } catch (err) {
    console.error('Error in updateTechnicianProfile:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Upload Profile Photo (Technician Only)
const uploadTechnicianPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    const technician = await Technician.findById(req.params.technicianId);
    if (!technician) {
      return res.status(404).json({ msg: 'Technician not found' });
    }
    if (technician._id.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Unauthorized: You can only update your own profile' });
    }

    technician.photo = req.file.path;
    await technician.save();

    res.status(200).json({ msg: 'Photo uploaded successfully', technician });
  } catch (err) {
    console.error('Error in uploadTechnicianPhoto:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTechnicianProfile,
  updateTechnicianProfile,
  uploadTechnicianPhoto
};