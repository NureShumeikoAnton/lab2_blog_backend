const express = require('express');
const { getAllCategories, updateCategory, deleteCategory } = require('../controllers/CategoryController');
const router = express.Router();

router.get('/', getAllCategories);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;