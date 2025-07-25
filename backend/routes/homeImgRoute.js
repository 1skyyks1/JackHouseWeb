const express = require('express');
const router = express.Router();
const HomeImgController = require('../controllers/homeImgController')
const checkAuth = require('../middleware/authMiddleware');
const ROLES = require('../config/roles');

// 获取主页头图
router.get('/home', HomeImgController.getHomeImg)

// 获取头图列表
router.get('/', checkAuth([ROLES.ORG,ROLES.ADMIN]), HomeImgController.getAllHomeImg)

// 上传头图
router.post('/', checkAuth([ROLES.ORG,ROLES.ADMIN]), HomeImgController.uploadHomeImg)

// 更新头图信息
router.put('/:img_id', checkAuth([ROLES.ORG,ROLES.ADMIN]), HomeImgController.updateHomeImg)

// 删除头图
router.delete('/:img_id', checkAuth([ROLES.ORG,ROLES.ADMIN]), HomeImgController.deleteHomeImg)

module.exports = router