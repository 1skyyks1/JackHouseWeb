const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const osuAuthController = require('../controllers/osu/osuAuthController');

// 生成授权链接并重定向
router.get('/osu', osuAuthController.authRedirect);

// 处理回调并完成登录
router.get('/osu/callback', osuAuthController.authCallback);

// 邮箱注册
router.post('/register', AuthController.register);

// 用户名/邮箱密码登录
router.post('/login', AuthController.login);

module.exports = router;