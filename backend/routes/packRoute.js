const express = require('express');
const router = express.Router();
const PackController = require('../controllers/pack/packController');
const OsuPackController = require('../controllers/osu/osuPackController');
const checkAuth = require('../middleware/authMiddleware');

// 获取所有包
router.get('/', PackController.getAllPacks)

// 获取指定包信息
router.get('/:pack_id', PackController.getPackById)

// 创建图包
router.post('/', checkAuth(), PackController.createPack)

// 从osu获取图包信息
router.get('/osu/:bid', checkAuth(), OsuPackController.beatmapsetDetail)

// 从osu录入图包信息
router.post('/osu/:bid', checkAuth(), OsuPackController.packFromOsu)

module.exports = router;