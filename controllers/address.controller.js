// controllers/address.controller.js
const Address = require('../models/address.model');

// Add New Address
exports.addAddress = async (req, res) => {
  const { title, street, city, state, postalCode, country, coordinates } = req.body;
  try {
    const newAddress = new Address({
      userId: req.user.userId,
      title,
      street,
      city,
      state,
      postalCode,
      country,
      coordinates
    });

    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get User's Addresses
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.userId });
    res.status(200).json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Address
exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.addressId, userId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!address) return res.status(404).json({ msg: 'Address not found' });
    res.status(200).json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.addressId,
      userId: req.user.userId
    });

    if (!address) return res.status(404).json({ msg: 'Address not found' });
    res.status(200).json({ msg: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
