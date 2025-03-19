// routes/technician.routes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { verifiedTechnician } = require('../middleware/verifiedTechnician');
const multer = require('multer'); // Replace custom upload middleware
const { getTechnicianProfile, updateTechnicianProfile, uploadTechnicianPhoto } = require('../controllers/technician.controller');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.put('/:technicianId', auth, verifiedTechnician, upload.single('verificationDocument'), updateTechnicianProfile);
router.get('/:technicianId', auth, verifiedTechnician, getTechnicianProfile);
router.post('/:technicianId/upload-photo', auth, verifiedTechnician, upload.single('photo'), uploadTechnicianPhoto);

console.log('auth:', typeof auth);
console.log('verifiedTechnician:', typeof verifiedTechnician);
console.log('updateTechnicianProfile:', typeof updateTechnicianProfile);

module.exports = router;