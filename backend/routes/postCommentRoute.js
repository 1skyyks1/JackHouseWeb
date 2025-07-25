const express = require('express');
const router = express.Router();
const PostCommentController = require('../controllers/postCommentController');
const checkAuth = require("../middleware/authMiddleware");
const ROLES = require("../config/roles");

// 获取指定帖子的所有评论
router.get('/post/:post_id', PostCommentController.getCommentsByPostId);

// 获取所有帖子所有评论
router.get('/', PostCommentController.getAllComments);

// 获取指定用户的所有评论
router.get('/user/:user_id', PostCommentController.getCommentsByUserId)

// 创建评论
router.post('/', checkAuth(), PostCommentController.createComment);

// 更新评论
router.put('/:comment_id', checkAuth([ROLES.ADMIN]), PostCommentController.updateComment);

// 删除评论
router.delete('/:comment_id', checkAuth(), PostCommentController.deleteComment);

module.exports = router;