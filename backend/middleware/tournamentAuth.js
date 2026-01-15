const { TStaff } = require('../models/tournament');
const User = require('../models/user/user');

/**
 * 检查用户是否有指定赛事的 Staff 权限
 * ADMIN 用户（role=2）可以绕过所有权限检查
 * @param {string[]} allowedRoles - 允许的角色列表
 */
const checkTournamentRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.user_id;
            const tid = req.params.tid;

            if (!userId) {
                return res.status(401).json({ message: '请先登录' });
            }

            // 检查是否是系统管理员（ADMIN），管理员可以执行任何操作
            const user = await User.findByPk(userId);
            if (user && user.role === 2) {
                req.staffRoles = ['admin'];
                return next();
            }

            // 查找用户在该赛事的角色
            const staffRoles = await TStaff.findAll({
                where: { t_id: tid, user_id: userId }
            });

            if (staffRoles.length === 0) {
                return res.status(403).json({ message: '无权限访问' });
            }

            const userRoles = staffRoles.map(s => s.role);

            // host 拥有所有权限
            if (userRoles.includes('host')) {
                req.staffRoles = userRoles;
                return next();
            }

            // 检查是否有允许的角色
            const hasPermission = allowedRoles.some(role => userRoles.includes(role));
            if (!hasPermission) {
                return res.status(403).json({ message: '无权限执行此操作' });
            }

            req.staffRoles = userRoles;
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '权限检查失败' });
        }
    };
};

// 预定义的权限检查中间件
const isHost = checkTournamentRole(['host']);
const isReferee = checkTournamentRole(['host', 'referee']);
const isPooler = checkTournamentRole(['host', 'pooler']);
const isStaff = checkTournamentRole(['host', 'referee', 'pooler', 'streamer', 'commentator']);

module.exports = {
    checkTournamentRole,
    isHost,
    isReferee,
    isPooler,
    isStaff
};
