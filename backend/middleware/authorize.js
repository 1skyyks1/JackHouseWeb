const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

// 验证 JWT 是否有效
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: '未提供令牌' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            return res.status(403).json({ message: '令牌无效' });
        }

        // 将用户信息传递到请求对象上
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;