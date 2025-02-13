const express = require('express');
const userRoutes = require('./routes/userRoute');
const authRoutes = require('./routes/authRoute');
const postRoutes = require('./routes/postRoute');
const postCommentRoutes = require('./routes/postCommentRoute');
const postFileRoutes = require('./routes/postFileRoute')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors'); // 引入 CORS
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: '*', // 允许的前端域名
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的 HTTP 方法
    allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
    credentials: true, // 允许发送 Cookie
})); // 启用 CORS

// API限流
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP允许的请求数
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// 解析 JSON 请求体
app.use(express.json());

// 路由
app.use('/api/user', userRoutes);
app.use('/api', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', postCommentRoutes)
app.use('/api/postFile', postFileRoutes)

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});