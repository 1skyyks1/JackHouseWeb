const ROLES = {
    USER: 0, // 普通用户
    ORG: 1, // 组织者
    ADMIN: 2 // 管理员
}

// Admin 页面权限配置
// 仅针对 /admin 下的页面，其他页面所有人可访问
const ADMIN_PERMISSIONS = {
    [ROLES.USER]: [], // 普通用户无 admin 权限
    [ROLES.ORG]: [
        'admin', 'dashboard', 'events', 'eventStages', 'badges'
    ],
    [ROLES.ADMIN]: ['*'] // 通配符表示所有 admin 页面
}

module.exports = { ROLES, ADMIN_PERMISSIONS }
