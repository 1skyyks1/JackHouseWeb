# 4Key Jack House
<br />
<p align="center">
    <a href="https://www.jackhouse.xyz/">
        <img src="frontend/src/assets/pic/jackHouseLight.png" alt="Logo" width="320" height="80">
    </a>
</p>
<div align="center">
    A community for jack players
    <br />
    <br />

**[English](README.md)**
·
**[简体中文](README_zh.md)**
</div>

## 📁 Project Structure
```
frontend
├── /public                 
├── /src                  // Main application source
│  ├── /api               // Request functions (Axios)
│  ├── /assets            // Font & image files
│  │  ├── /font
│  │  └── /pic
│  ├── /components        // Reusable Vue components
│  │  ├── /ui             // UI primitives from shadcn-vue
│  │  └── ...
│  ├── /lib               // Core library utilities
│  ├── /locale            // I18n language files
│  ├── /router            // Vue Router configuration
│  ├── /store             // Vuex state
│  ├── /style             // Global CSS styles
│  ├── /utils             // General utility functions
│  ├── /views             // Page-level components
│  │  ├── /admin          // Admin dashboard pages
│  │  ├── /auth
│  │  └── ...
│  ├── App.vue            // Root Vue component
│  └── main.js            // Application entry point
├── components.json       // shadcn-vue CLI configuration
├── index.html            // Main Template for SPA
├── jsconfig.json         // JS configuration
├── package-lock.json
├── package.json
└── vite.config.js
```

```
backend
├── /config               // Service configurations
│  ├── db.js              // Database (Sequelize) connection
│  ├── minio.js           // MinIO client setup
│  └── ...
├── /controller           // Request handlers
├── /middleware           // Express middleware
├── /models               // Database models
├── /routes               // API endpoint definitions
├── /utils                // Backend utility functions
├── package-lock.json
├── package.json
└── server.js             // Backend server entry point
```

## 🛠️ Tech Stack

### Frontend

| Tech              | Description                                |
|-------------------|--------------------------------------------|
| Vue 3             | A JavaScript framework for building UIs    |
| Vite              | Next-generation frontend tooling           |
| Vue Router        | Official router for Vue.js                 |
| Vuex              | Official state management for Vue.js       |
| Element Plus      | A Vue 3 UI component library               |
| Tailwind CSS      | A utility-first CSS framework              |
| Axios             | Promise-based HTTP client                  |
| WangEditor        | Rich-text editor component                 |
| Vue-i18n          | Internationalization plugin for Vue.js     |

### Backend

| Tech              | Description                                |
|-------------------|--------------------------------------------|
| Node.js           | JavaScript runtime environment             |
| Express.js        | Web application framework for Node.js      |
| Sequelize         | Promise-based Node.js ORM                  |
| MariaDB           | Open-source relational database            |
| JWT               | For implementing JWT-based authentication  |
| Bcrypt.js         | Password hashing library                   |
| Multer & MinIO    | File upload handling & object storage      |
| Helmet & CORS     | App security & cross-origin handling       |
| Dotenv            | Environment variable management            |


## 🚀 Setup
Before you begin, ensure you have the following software installed on your development machine:
Node.js (v18.x or higher is recommended), NPM or Yarn, MariaDB Database Service...

1. Clone the Repository
```sh
git clone https://github.com/1skyyks1/jackhouse.git

cd jackhouse
```

2. Backend Setup (/backend)
```sh
cd backend

npm install

node server.js
```

3. Frontend Setup (/frontend)
```sh
cd frontend

npm install

npm run dev
```