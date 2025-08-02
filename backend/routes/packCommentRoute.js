const express = require('express');
const router = express.Router();
const PackCommentController = require('../controllers/packCommentController');
const checkAuth = require('../middleware/authMiddleware');

// 图包下发表评论
router.post('/', checkAuth(), PackCommentController.addComment)

// 获取图包评论
router.get('/:pack_id', PackCommentController.getCommentsByPackId)

// 删除评论
router.delete('/:comment_id', checkAuth(), PackCommentController.deleteComment);

module.exports = router;