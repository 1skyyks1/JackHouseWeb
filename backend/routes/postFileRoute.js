const express = require('express');
const router = express.Router();
const postFileController = require('../controllers/postFileController');

// 获取指定帖子的所有投稿
router.get('/post/:post_id', postFileController.getFileByPostId);

// 获取所有帖子所有投稿
router.get('/', postFileController.getAllPostFiles);

// 获取指定用户的所有投稿
router.get('/user/:user_id', postFileController.getFileByUserId)

// 创建投稿
router.post('/', postFileController.createPostFile);

// 更新投稿
router.put('/:file_id', postFileController.updatePostFile);

// 删除投稿
router.delete('/:file_id', postFileController.deletePostFile);

module.exports = router;