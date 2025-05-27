const express = require('express');
const {getAllComments, getCommentsByPostId, createComment, deleteComment} = require('../controllers/CommentController');
const router = express.Router();

router.get('/', getAllComments);
router.get('/:id', getCommentsByPostId);
router.post('/', createComment);
router.delete('/:id', deleteComment);

module.exports = router;