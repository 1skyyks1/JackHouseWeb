const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user/userController');
const checkAuth = require("../middleware/authMiddleware");
const { ROLES } = require("../config/roles");

// 创建用户
router.post('/', UserController.createUser);

// 获取所有用户
router.get('/', UserController.getUsers);

// 根据token获取用户信息
router.get('/info', checkAuth(), UserController.getUserInfo)

// 获取单个用户
router.get('/:user_id', UserController.getUserById);

// 更新用户
router.put('/:user_id', checkAuth(), UserController.updateUser);

// 删除用户
router.delete('/:user_id', checkAuth([ROLES.ORG, ROLES.ADMIN]), UserController.deleteUser);

module.exports = router;
