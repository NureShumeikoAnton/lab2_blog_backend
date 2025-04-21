const express = require('express');
const {getAllComments, getCommentsByPostId, createComment} = require('../controllers/CommentController');
const router = express.Router();

router.get('/', getAllComments);
router.get('/:id', getCommentsByPostId);
router.post('/', createComment);

module.exports = router;