const { generateAuthUrl, exchangeCodeForToken, getUserInfo } = require('../utils/oauth');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// 生成授权链接并重定向
const authRedirect = (req, res) => {
    const state = crypto.randomBytes(32).toString('hex');
    const authUrl = generateAuthUrl(state);
    res.redirect(authUrl);
};

// 处理回调并完成登录
const authCallback = async (req, res) => {
    const { code, state } = req.query;

    // 验证 state 参数（实际应用中需持久化并验证）
    if (!state) {
        return res.status(400).json({ message: 'Invalid state' });
    }

    try {
        // 使用 code 换取 access_token
        const tokenResponse = await exchangeCodeForToken(code);
        if (!tokenResponse.access_token) {
            return res.status(400).json({ message: 'Failed to get access token' });
        }

        // 获取用户信息
        const userInfo = await getUserInfo(tokenResponse.access_token);
        if (!userInfo) {
            return res.status(400).json({ message: 'Failed to get user info' });
        }

        // 查找或创建用户
        let user = await User.findOne({
            where: { osu_uid: userInfo.id }
        });
        if (!user) {
            user = await User.create({
                user_name: userInfo.username,
                osu_uid: userInfo.id,
                avatar: userInfo.avatar_url,
                role: 0, // 默认角色
                status: 0, // 默认状态
            });
        }

        // 生成 JWT
        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // 重定向到前端完成页面
        res.redirect(`${process.env.FRONTEND_URL}/oauth/complete?token=${token}`);
    } catch (error) {
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
};

module.exports = {
    authRedirect,
    authCallback,
};