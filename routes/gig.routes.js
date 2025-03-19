// routes/gig.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middleware/auth');
const {
  postGig,
  getAllGigs,
  getUserGigs,
  getGigsByCategory,
  getGigDetails,
  deleteGig
} = require('../controllers/gig.controller');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/gigs');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

console.log('auth:', typeof auth);
console.log('getGigDetails:', typeof getGigDetails);

router.post('/', auth, upload.single('images'), postGig); // Added Multer
router.post('/user', auth, getUserGigs);
router.get('/', auth, getUserGigs); // Note: getAllGigs might be intended here
router.get('/category', auth, getGigsByCategory);
router.get('/:gigId', auth, getGigDetails);
router.delete('/:gigId', auth, deleteGig);

module.exports = router;