const express = require('express');
const router = express.Router();
const HomeImgController = require('../controllers/homeImgController')

// 获取主页头图
router.get('/home', HomeImgController.getHomeImg)

// 获取头图列表
router.get('/', HomeImgController.getAllHomeImg)

// 上传头图
router.post('/', HomeImgController.uploadHomeImg)

// 更新头图信息
router.put('/:img_id', HomeImgController.updateHomeImg)

// 删除头图
router.delete('/:img_id', HomeImgController.deleteHomeImg)

module.exports = router