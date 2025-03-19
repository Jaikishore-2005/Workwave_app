// controllers/quote.controller.js
const Quote = require('../models/quote.model');
const Gig = require('../models/gig.model');
const Technician = require('../models/technician.model');
const Booking = require('../models/booking.model'); // For booking creation
const Notification = require('../models/notification.model'); // For notifications
const mongoose = require('mongoose');

// Submit a Quote (Technician Only, Verified)
const submitQuote = async (req, res) => {
  if (req.user.role !== 'technician') {
    return res.status(403).json({ msg: 'Access denied' });
  }
  const { gigId, amount, message } = req.body;
  try {
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    const technician = await Technician.findById(req.user.userId);
    if (!technician) return res.status(404).json({ msg: 'Technician not found' });

    if (technician.skillCategory.toString() !== gig.category.toString()) {
      return res.status(400).json({ msg: 'Irrelevant skill category for this gig' });
    }

    const existingQuote = await Quote.findOne({ gigId, technicianId: req.user.userId });
    if (existingQuote) return res.status(400).json({ msg: 'You have already quoted for this Gig' });

    const newQuote = new Quote({
      gigId,
      technicianId: req.user.userId,
      amount,
      message
    });

    await newQuote.save();
    res.status(201).json(newQuote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View Quotes for a Gig (User Only)
const getQuotesForGig = async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ msg: 'Access denied' });
  }
  try {
    const quotes = await Quote.find({ gigId: req.params.gigId }).populate('technicianId', 'name');
    res.status(200).json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Quotes by Technician (Technician Only)
const getQuotesByTechnician = async (req, res) => {
  try {
    const quotes = await Quote.find({ technicianId: req.user.userId })
      .populate('gigId', 'title')
      .populate('technicianId', 'name');
    res.status(200).json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Accept or Reject a Quote (User Only)
const updateQuoteStatus = async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ msg: 'Access denied' });
  }
  const { status, date, time } = req.body; // Date and time for booking
  try {
    const quote = await Quote.findById(req.params.quoteId)
      .populate('gigId')
      .populate('technicianId');
    if (!quote) return res.status(404).json({ msg: 'Quote not found' });

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    quote.status = status;
    await quote.save();

    let newBooking;
    if (status === 'Accepted') {
      // Check for existing booking
      const existingBooking = await Booking.findOne({ quoteId: quote._id });
      if (existingBooking) {
        return res.status(400).json({ msg: 'Booking already exists for this quote' });
      }

      // Create booking
      newBooking = new Booking({
        quoteId: quote._id,
        gigId: quote.gigId._id,
        userId: req.user.userId,
        technicianId: quote.technicianId._id,
        date: date || quote.gigId.date || new Date(), // Use gig date if provided, else now
        time: time || quote.gigId.time || 'Not specified', // Use gig time if provided
        status: 'Scheduled'
      });
      await newBooking.save();

      // Send notification to technician
      const notification = new Notification({
        userId: req.user.userId,
        technicianId: quote.technicianId,
        message: `Your quote for "${quote.gigId.title}" has been accepted and a booking has been scheduled.`
      });
      await notification.save();
    }

    res.status(200).json({ 
      msg: `Quote ${status.toLowerCase()} successfully`, 
      booking: status === 'Accepted' ? newBooking : undefined 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Quote Details or Quotes by Gig (User or Technician)
const getQuoteDetails = async (req, res) => {
  const { quoteId } = req.params;

  try {
    const quote = await Quote.findById(quoteId)
      .populate('gigId', 'title')
      .populate('technicianId', 'name');

    if (quote) {
      const gig = await Gig.findById(quote.gigId);
      if (req.user.role === 'user' && gig.userId.toString() === req.user.userId) {
        return res.status(200).json(quote);
      }
      if (req.user.role === 'technician' && quote.technicianId.toString() === req.user.userId) {
        return res.status(200).json(quote);
      }
      return res.status(403).json({ msg: 'Access denied: You do not have permission to view this quote' });
    }

    if (mongoose.Types.ObjectId.isValid(quoteId)) {
      const quotes = await Quote.find({ gigId: quoteId })
        .populate('gigId', 'title')
        .populate('technicianId', 'name');

      if (quotes.length > 0) {
        const gig = await Gig.findById(quoteId);
        if (!gig) return res.status(404).json({ msg: 'Gig not found' });

        if (req.user.role === 'user' && gig.userId.toString() === req.user.userId) {
          return res.status(200).json(quotes);
        }
        const technicianQuotes = quotes.filter(q => q.technicianId.toString() === req.user.userId);
        if (req.user.role === 'technician' && technicianQuotes.length > 0) {
          return res.status(200).json(technicianQuotes);
        }
        return res.status(403).json({ msg: 'Access denied: You do not have permission to view these quotes' });
      }
    }

    return res.status(404).json({ msg: 'Quote or Gig not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  submitQuote,
  getQuotesForGig,
  getQuotesByTechnician,
  updateQuoteStatus,
  getQuoteDetails
};