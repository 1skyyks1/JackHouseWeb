const express = require('express');
const router = express.Router();
const postFileController = require('../controllers/postFileController');

// 获取指定帖子的所有投稿
router.get('/post/:post_id', postFileController.getFileByPostId);

// 获取所有帖子所有投稿
router.get('/', postFileController.getAllPostFiles);

// 获取指定用户的所有投稿
router.get('/user/:user_id', postFileController.getFileByUserId)

// 上传投稿
router.post('/upload', postFileController.uploadPostFile);

// 创建投稿
router.post('/', postFileController.createPostFile);

// 更新投稿
router.put('/:file_id', postFileController.updatePostFile);

// 审核投稿
router.put('/review/:file_id', postFileController.reviewPostFile)

// 删除投稿
router.delete('/:file_id', postFileController.deletePostFile);

// 获取文件下载 URL
router.get('/url/:file_id', postFileController.postFileUrl);

module.exports = router;