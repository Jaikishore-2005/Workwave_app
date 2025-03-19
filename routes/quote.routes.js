// routes/quote.routes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { verifiedTechnician } = require('../middleware/verifiedTechnician');
const {
  submitQuote,
  getQuotesForGig,
  getQuotesByTechnician,
  updateQuoteStatus,
  getQuoteDetails
} = require('../controllers/quote.controller');

console.log('submitQuote:', typeof submitQuote);
console.log('getQuotesForGig:', typeof getQuotesForGig);
console.log('getQuotesByTechnician:', typeof getQuotesByTechnician);
console.log('updateQuoteStatus:', typeof updateQuoteStatus);
console.log('getQuoteDetails:', typeof getQuoteDetails);

router.get('/technician', auth, verifiedTechnician, getQuotesByTechnician);
router.post('/', auth, verifiedTechnician, submitQuote);
router.get('/gig/:gigId', auth, getQuotesForGig); // Existing, keep it
router.put('/:quoteId', auth, updateQuoteStatus);
router.get('/:quoteId', auth, getQuoteDetails);   // Keep for single quote
router.get('/gig/:gigId/quotes', auth, getQuotesForGig); // New route for clarity

module.exports = router;