const express = require('express');
const router = express.Router();
const BadgeController = require(`../controllers/user/badgeController`);
const checkAuth = require('../middleware/authMiddleware');
const ROLES = require("../config/roles");

// 获取牌子列表
router.get('/', checkAuth([ROLES.ORG,ROLES.ADMIN]), BadgeController.getAllBadges)

// 上传牌子
router.post('/', checkAuth([ROLES.ORG,ROLES.ADMIN]), BadgeController.uploadBadge)

// 添加拥有者
router.post('/:id', checkAuth([ROLES.ORG,ROLES.ADMIN]), BadgeController.addUsersToBadge)

module.exports = router;