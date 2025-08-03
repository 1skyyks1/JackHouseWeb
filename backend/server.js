const express = require('express');
const userRoutes = require('./routes/userRoute');
const authRoutes = require('./routes/authRoute');
const postRoutes = require('./routes/postRoute');
const postCommentRoutes = require('./routes/postCommentRoute');
const postFileRoutes = require('./routes/postFileRoute');
const homeImgRoutes = require('./routes/homeImgRoute')
const dashboardRoutes = require('./routes/dashboardRoute')
const packRoutes = require('./routes/packRoute')
const tagRoutes = require('./routes/tagRoute')
const packCommentRoutes = require('./routes/packCommentRoute')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const i18nextMiddleware = require('i18next-http-middleware')
require('dotenv').config();

i18next.use(Backend).use(i18nextMiddleware.LanguageDetector).init({
    backend: {
        loadPath: `${__dirname}/locale/{{lng}}.json`,
    },
    fallbackLng: 'en',
    preload: ['en', 'zh'],

})

const app = express();

app.use(i18nextMiddleware.handle(i18next));

const port = process.env.PORT || 3000;

app.set('trust proxy', 'loopback');
app.get('/ip', (request, response) => response.send(request.ip))

// 安全中间件
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: '*', // 允许的前端域名
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的 HTTP 方法
    allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
    credentials: true, // 允许发送 Cookie
})); // 启用 CORS

// API限流
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 200, // 每个IP允许的请求数
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// 解析 JSON 请求体
app.use(express.json());

// 路由
app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/post', postRoutes);
app.use('/comment', postCommentRoutes);
app.use('/postFile', postFileRoutes);
app.use('/homeImg', homeImgRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/pack', packRoutes);
app.use('/tag', tagRoutes);
app.use('/packCom', packCommentRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
});