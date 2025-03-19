// routes/user.routes.js
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getUserProfile, updateUserProfile, uploadPhoto } = require('../controllers/user.controller');

// Custom Multer config for user photos
const uploadDir = path.join(__dirname, '../uploads/user-photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Custom path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const userPhotoUpload = multer({ storage });

router.get('/profile', auth, authorize(['user']), getUserProfile);
router.put('/:userId', auth, authorize(['user']), updateUserProfile);
router.post('/profile/upload-photo', auth, authorize(['user']), userPhotoUpload.single('photo'), uploadPhoto);

module.exports = router;