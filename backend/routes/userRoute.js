const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// 创建用户
router.post('/', UserController.createUser);

// 获取所有用户
router.get('/', UserController.getUsers);

// 获取单个用户
router.get('/:user_id', UserController.getUserById);

// 更新用户
router.put('/:user_id', UserController.updateUser);

// 删除用户
router.delete('/:user_id', UserController.deleteUser);

module.exports = router;
