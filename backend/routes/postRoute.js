const express = require('express');
const router = express.Router();
const PostController = require('../controllers/postController');

// 获取所有帖子
router.get('/', PostController.getAllPosts);

// 获取指定类型帖子列表
router.get('/type/:type', PostController.getPostByType)

// 获取指定类型帖子列表（有帖子内容），用于主页公告栏
router.get('/typeWithContent/:type', PostController.getPostWithContentByType)

// 获取某个用户的所有帖子
router.get('/user/:user_id', PostController.getPostsByUserId);

// 搜索帖子
router.get('/search', PostController.searchPosts);

// 获取每种类型最新的三个帖子
router.get('/forum', PostController.getAllType3Posts)

// 获取某用户的所有征稿帖
router.get('/requestPost/:user_id', PostController.getRequestPostByUserId)

// 获取单个帖子
router.get('/:post_id', PostController.getPostById);

// 创建帖子
router.post('/', PostController.createPost);

// 更新帖子
router.put('/:post_id', PostController.updatePost);

// 删除帖子
router.delete('/:post_id', PostController.deletePost);

module.exports = router;
