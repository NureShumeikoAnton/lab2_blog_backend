const express = require('express');
const router = express.Router();
const {getAllPosts, getPostById, createPost} = require('../controllers/PostController');

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', createPost);

module.exports = router;