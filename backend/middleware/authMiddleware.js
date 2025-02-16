const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 从请求头中获取 token
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: '未提供 token，访问被拒绝' });
    }

    try {
        // 验证 token
        // 将用户信息附加到请求对象中
        req.user = jwt.verify(token, process.env.JWT_SECRET); // { userId, role }

        // 继续执行下一个中间件或路由
        next();
    } catch (error) {
        res.status(401).json({ message: '无效的 token', error: error.message });
    }
};

module.exports = authMiddleware;