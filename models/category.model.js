// models/category.model.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['Electrical', 'Plumbing', 'Carpentry', 'Painting'],
    required: true,
    unique: true
  },
  icon: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Category', CategorySchema);
