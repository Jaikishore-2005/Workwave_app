// routes/category.routes.js
const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById } = require('../controllers/category.controller');

// Get All Categories
router.get('/', getCategories);

// Get Category by ID
router.get('/:categoryId', getCategoryById);

module.exports = router;
