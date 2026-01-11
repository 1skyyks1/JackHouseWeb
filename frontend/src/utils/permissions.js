import store from '@/store'

/**
 * 检查当前用户是否有权访问指定的 admin 页面
 * @param routeName 路由 name
 */
export function hasAdminPermission(routeName) {
    const permissions = store.state.adminPermissions
    return permissions.includes('*') || permissions.includes(routeName)
}

/**
 * 检查当前用户是否有任意 admin 权限（用于显示 admin 入口）
 */
export function hasAnyAdminPermission() {
    const permissions = store.state.adminPermissions
    return permissions.length > 0
}
