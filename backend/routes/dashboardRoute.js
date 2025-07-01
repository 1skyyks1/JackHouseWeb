const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController')

// 获取主页数据
router.get('/home', DashboardController.userAndPostCount)

module.exports = router;