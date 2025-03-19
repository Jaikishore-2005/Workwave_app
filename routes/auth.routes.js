// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { userSignup, technicianSignup, login } = require('../controllers/auth.controller');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});
const upload = multer({ storage });

router.post('/user/signup', userSignup);
router.post('/technician/signup', upload.single('verificationDocument'), technicianSignup);
router.post('/login', login);

module.exports = router;