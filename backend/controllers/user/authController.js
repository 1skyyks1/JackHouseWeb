const User = require('../../models/user/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createUser } = require('./userController');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// 邮箱注册
const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 检查邮箱是否已注册
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: req.t('auth.emailRegistered') });
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

        res.status(201).json({ data: { message: req.t('auth.registerSuccess'), token, userId: user.user_id } });
    } catch (error) {
        res.status(500).json({ message: req.t('auth.registerFailed') });
    }
};

// 用户名或邮箱登录
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
            return res.status(400).json({ message: req.t('auth.userNotFound') });
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: req.t('auth.wrongPassword') });
        }

        // 生成 JWT
        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ data: { message: req.t('auth.loginSuccess'), token, userId: user.user_id } });
    } catch (error) {
        res.status(500).json({ message: req.t('auth.loginFailed') });
    }
};

module.exports = {
    register,
    login
};