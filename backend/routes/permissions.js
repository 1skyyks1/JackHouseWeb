const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/authMiddleware')
const { ADMIN_PERMISSIONS } = require('../config/roles')

// 获取当前用户的 admin 页面权限
router.get('/', checkAuth(), (req, res) => {
    const userRole = req.user.role
    const permissions = ADMIN_PERMISSIONS[userRole] || []
    res.json({ role: userRole, adminPermissions: permissions })
})

module.exports = router
