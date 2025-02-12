const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');

// 获取所有帖子
router.get('/', PostController.getAllPosts);

// 获取某个用户的所有帖子
router.get('/user/:user_id', PostController.getPostsByUserId);

// 获取单个帖子
router.get('/:post_id', PostController.getPostById);

// 创建帖子
router.post('/', PostController.createPost);

// 更新帖子
router.put('/:post_id', PostController.updatePost);

// 删除帖子
router.delete('/:post_id', PostController.deletePost);

module.exports = router;
