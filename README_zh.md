# 4Key Jack House
<br />
<p align="center">
    <a href="https://www.jackhouse.xyz/">
        <img src="frontend/src/assets/pic/jackHouseLight.png" alt="Logo" width="320" height="80">
    </a>
</p>
<div align="center">
    一个为叠键玩家打造的社区
    <br />
    <br />

**[English](README.md)**
·
**[简体中文](README_zh.md)**
</div>

## 📁 项目结构
```
frontend
├── /public                 
├── /src                  // 核心代码
│  ├── /api               // 请求函数 (Axios)
│  ├── /assets            // 静态资源如字体、图片
│  │  ├── /font
│  │  └── /pic
│  ├── /components        // 可复用的 Vue 组件
│  │  ├── /ui             // shadcn-vue 的 UI 组件
│  │  └── ...
│  ├── /lib               // 核心库函数，如 cn()
│  ├── /locale            // 国际化 (i18n)
│  ├── /router            // 路由配置
│  ├── /store             // 状态管理
│  ├── /style             // 全局 CSS 样式
│  ├── /utils             // 通用工具函数
│  ├── /views             // 页面级组件
│  │  ├── /admin          // 管理后台页面
│  │  ├── /auth
│  │  └── ...
│  ├── App.vue            // 根 Vue 组件
│  └── main.js            // 应用入口
├── components.json       // shadcn-vue 命令行工具配置
├── index.html            // SPA 模板
├── jsconfig.json         // JS 配置
├── package-lock.json
├── package.json
└── vite.config.js
```

```
backend
├── /config               // 服务配置文件
│  ├── db.js              // 数据库 (Sequelize) 连接配置
│  ├── minio.js           // MinIO 客户端配置
│  └── ...
├── /controller           // 核心业务逻辑
├── /middleware           // 中间件
├── /models               // 数据库模型
├── /routes               // 路由定义
├── /utils                // 通用工具函数
├── package-lock.json
├── package.json
└── server.js             // 入口文件
```

## 🛠️ 技术栈

### 前端

| 技术         | 描述                               |
|--------------|----------------------------------|
| Vue 3        | JavaScript 框架 |
| Vite         | 前端构建工具                 |
| Vue Router   | Vue.js 官方路由管理器              |
| Vuex         | Vue.js 官方状态管理库              |
| Element Plus | Vue 3 UI 组件库               |
| Tailwind CSS | CSS 框架              |
| Axios        | 基于 Promise 的 HTTP 客户端        |
| WangEditor   | 富文本编辑器                       |
| Vue-i18n     | Vue.js 国际化插件                  |

### 后端

| 技术           | 描述                              |
|--------------|---------------------------------|
| Node.js      | JavaScript 运行环境             |
| Express.js   | Node.js Web 应用框架             |
| Sequelize    | 基于 Promise 的 Node.js ORM       |
| MariaDB      | 开源关系型数据库                   |
| JWT          | 用户认证              |
| Bcrypt.js    | 密码哈希库                        |
| Multer & MinIO | 文件上传处理与对象存储             |
| Helmet & CORS | 应用安全与跨域处理                 |
| Dotenv       | 环境变量管理                      |


## 🚀 安装
开始前，请确保您的开发环境已安装以下软件：
Node.js（推荐 v18.x 或更高版本）、NPM 或 Yarn、MariaDB 数据库服务...

1. 克隆仓库
```sh
git clone https://github.com/1skyyks1/jackhouse.git

cd jackhouse
```

2. 后端配置 (/backend)
```sh
cd backend

npm install

node server.js
```

3. 前端配置 (/frontend)
```sh
cd frontend

npm install

npm run dev
```