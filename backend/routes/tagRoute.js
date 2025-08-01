const express = require('express');
const router = express.Router();
const TagController = require('../controllers/tagController');
const checkAuth = require('../middleware/authMiddleware');

// 获取所有tags
router.get('/', TagController.getAllTags)

module.exports = router;