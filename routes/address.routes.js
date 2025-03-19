const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress
} = require('../controllers/address.controller');

console.log('auth:', typeof auth);
console.log('addAddress:', typeof addAddress);

router.post('/', auth, addAddress);
router.get('/', auth, getAddresses);
router.put('/:addressId', auth, updateAddress);
router.delete('/:addressId', auth, deleteAddress);

module.exports = router;