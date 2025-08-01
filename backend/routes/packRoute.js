const express = require('express');
const router = express.Router();
const PackController = require('../controllers/packController');
const checkAuth = require('../middleware/authMiddleware');

// 获取所有包
router.get('/', PackController.getAllPacks)

// 获取指定包信息
router.get('/:pack_id', PackController.getPackById)

// 创建图包
router.post('/', checkAuth(), PackController.createPack)

module.exports = router;