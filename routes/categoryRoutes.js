const express = require('express');
const { getAllCategories } = require('../controllers/CategoryController');
const router = express.Router();

router.get('/', getAllCategories);

module.exports = router;