const express = require('express');
const router = express.Router();
const {getAllPosts, getPostById, createPost, deletePost} = require('../controllers/PostController');

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', createPost);
router.delete('/:id', deletePost);

module.exports = router;