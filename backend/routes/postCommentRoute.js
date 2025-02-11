const express = require('express');
const router = express.Router();
const PostCommentController = require('../controllers/PostCommentController');

// 获取指定帖子的所有评论
router.get('/post/:post_id', PostCommentController.getCommentsByPostId);

// 获取单个评论
router.get('/:comment_id', PostCommentController.getCommentById);

// 创建评论
router.post('/', PostCommentController.createComment);

// 更新评论
router.put('/:comment_id', PostCommentController.updateComment);

// 删除评论
router.delete('/:comment_id', PostCommentController.deleteComment);

module.exports = router;
