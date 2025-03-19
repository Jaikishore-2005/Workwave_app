// controllers/category.controller.js
const Category = require('../models/category.model');

// Get All Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
