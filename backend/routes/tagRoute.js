const express = require('express');
const router = express.Router();
const TagController = require('../controllers/pack/tagController');
const checkAuth = require('../middleware/authMiddleware');
const ROLES = require("../config/roles");

// 获取所有tags
router.get('/', TagController.getAllTags)

// 更新tags
router.post('/:pack_id', checkAuth([ROLES.ADMIN]), TagController.updateTags)

module.exports = router;