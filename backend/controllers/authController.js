const { generateAuthUrl, exchangeCodeForToken, getUserInfo } = require('../utils/oauth');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createUser } = require('./userController');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// 生成授权链接并重定向
const authRedirect = (req, res) => {
    const state = crypto.randomBytes(32).toString('hex');
    const authUrl = generateAuthUrl(state);
    res.redirect(authUrl);
};

const auth = (req, res) => {
    const url = new URL(
        "https://osu.ppy.sh/oauth/authorize"
    );
    const params = {
        "client_id": process.env.OSU_CLIENT_ID,
        "redirect_uri": process.env.OSU_REDIRECT_URI,
        "response_type": "code",
        "scope": "public identify",
        "state": crypto.randomBytes(32).toString('hex'),
    };
    Object.keys(params)
        .forEach(key => url.searchParams.append(key, params[key]));
    res.redirect(url)
}

// 处理回调并完成登录
const authCallback = async (req, res) => {
    const { code, state } = req.query;

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
        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // 重定向到前端完成页面
        res.redirect(`${process.env.FRONTEND_URL}/oauth/complete?token=${token}&userId=${user.user_id}`);
    } catch (error) {
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
};

//邮箱注册
const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 检查邮箱是否已注册
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: '邮箱已被注册' });
        }

        // 调用 createUser 创建用户
        const user = await createUser({
            body: {
                user_name: username,
                email,
                password,
                role: 0, // 默认角色
                status: 0, // 默认状态
            },
        }, res);

        // 生成 JWT
        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ message: '用户注册成功', token, userId: user.user_id });
    } catch (error) {
        res.status(500).json({ message: '注册失败', error: error.message });
    }
};

//用户名或邮箱登录
const login = async (req, res) => {
    const { identifier, password } = req.body; // identifier 可以是用户名或邮箱

    try {
        // 查找用户
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { user_name: identifier },
                    { email: identifier },
                ],
            },
        });

        if (!user) {
            return res.status(400).json({ message: '用户未找到' });
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: '密码错误' });
        }

        // 生成 JWT
        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ message: '登录成功', token, userId: user.user_id });
    } catch (error) {
        res.status(500).json({ message: '登录失败', error: error.message });
    }
};

module.exports = {
    auth,
    authRedirect,
    authCallback,
    register,
    login
};