const { TStaff } = require('../../models/tournament');
const User = require('../../models/user/user');

// 获取 Staff 列表
exports.getStaff = async (req, res) => {
    try {
        const { tid } = req.params;
        const staff = await TStaff.findAll({
            where: { t_id: tid },
            include: [{ model: User, as: 'user', attributes: ['user_id', 'user_name', 'avatar'] }]
        });
        res.json(staff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 添加 Staff
exports.addStaff = async (req, res) => {
    try {
        const { tid } = req.params;
        const { user_id, role } = req.body;

        // 验证角色
        const validRoles = ['host', 'referee', 'pooler', 'streamer', 'commentator'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: '无效的角色' });
        }

        // 检查是否已存在
        const existing = await TStaff.findOne({ where: { t_id: tid, user_id, role } });
        if (existing) {
            return res.status(400).json({ message: '该用户已拥有此角色' });
        }

        const staff = await TStaff.create({ t_id: tid, user_id, role });
        res.status(201).json(staff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 移除 Staff
exports.removeStaff = async (req, res) => {
    try {
        const { tid, staffId } = req.params;

        const staff = await TStaff.findOne({ where: { id: staffId, t_id: tid } });
        if (!staff) {
            return res.status(404).json({ message: 'Staff 不存在' });
        }

        await staff.destroy();
        res.json({ message: '已移除' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};
