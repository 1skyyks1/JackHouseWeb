const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// 生成授权链接并重定向
router.get('/auth/osu', AuthController.authRedirect);

// 处理回调并完成登录
router.get('/auth/osu/callback', AuthController.authCallback);

module.exports = router;