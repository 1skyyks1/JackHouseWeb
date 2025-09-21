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
const eventRoutes = require('./routes/eventRoute');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const i18nextMiddleware = require('i18next-http-middleware');
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
const commonLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 200, // 每个IP允许的请求数
    standardHeaders: true,
    legacyHeaders: false,
});

// osu-api
const osuLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
})

// 解析 JSON 请求体
app.use(express.json());

// 路由
app.use('/user', commonLimiter, userRoutes);
app.use('/auth', osuLimiter, authRoutes);
app.use('/post', commonLimiter, postRoutes);
app.use('/comment', commonLimiter, postCommentRoutes);
app.use('/postFile', commonLimiter, postFileRoutes);
app.use('/homeImg', commonLimiter, homeImgRoutes);
app.use('/dashboard', commonLimiter, dashboardRoutes);
app.use('/pack', commonLimiter, packRoutes);
app.use('/tag', commonLimiter, tagRoutes);
app.use('/packCom', commonLimiter, packCommentRoutes);
app.use('/event', commonLimiter, eventRoutes)

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
});