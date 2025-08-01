const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

const checkAuth = (roles = []) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Please Login' });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findByPk(decoded.userId, {
                attributes: {exclude: ['password']}
            });

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }
            if (roles.length > 0) {
                const userRole = user.role;
                if (!userRole || !roles.includes(userRole)) {
                    return res.status(403).json({ message: '权限不足' })
                }
            }
            req.user = user;
            next()
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: '认证失败：Token已过期' });
            }
            return res.status(401).json({ message: '认证失败：无效的Token' });
        }
    }
}

module.exports = checkAuth;