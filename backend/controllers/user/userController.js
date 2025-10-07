const { User, Post, Badge } = require('../../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const ROLES = require("../../config/roles");
const mc = require('../../config/minio')

// 创建用户
const createUser = async (req, res) => {
    try {
        const { user_name, password, email, role, status, osu_uid, avatar } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ user_name, password: hashedPassword, email, role, status, osu_uid, avatar });
        res.status(201).json({ message: req.t('user.createSuccess') });
    } catch (err) {
        res.status(500).json({ message: req.t('user.createFailed') });
    }
};

// 获取所有用户
const getUsers = async (req, res) => {
    const { page, pageSize, search } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    try {
        const whereCondition = {};
        if (search) {
            whereCondition.user_name = {
                [Op.like]: `%${search}%`
            };
        }
        const { count, rows } = await User.findAndCountAll(
            {
                attributes: { exclude: ['password'] } ,
                where: whereCondition,
                order: [['created_time', 'DESC']],
                offset,
                limit
            }
        );
        const totalPages = Math.ceil(count / limit);
        res.status(200).json({ data: rows, page: parseInt(page, 10), pageSize: limit, totalPages, total: count });
    } catch (err) {
        res.status(500).json({ message: req.t('user.listFailed') });
    }
};

// 获取单个用户
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.user_id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Badge,
                    as: 'badges',
                    through: { attributes: [] }
                }
            ]
        });
        if (!user) {
            return res.status(404).json({ message: req.t('user.notFound') });
        }

        // 获取badge
        const userData = user.toJSON();
        if (userData.badges && userData.badges.length > 0) {
            const signedBadge = userData.badges.map(async (badge) => {
                const signedUrl = await preSign(badge.minio_img_name);
                delete badge.minio_img_name;
                if (badge.url) {
                    delete badge.url;
                }
                badge.signedUrl = signedUrl;
                return badge;
            });
            userData.badges = await Promise.all(signedBadge);
        }
        res.status(200).json({ data: userData });
    } catch (err) {
        res.status(500).json({ message: req.t('user.getFailed') });
    }
};

// 处理badge预签名
const preSign = async (name) => {
    const expires = 24 * 60 * 60;
    return await mc.presignedUrl('GET', process.env.MINIO_BADGES_BUCKET, name, expires)
}

// 更新用户
const updateUser = async (req, res) => {
    const user_id = req.user.user_id;
    const role = req.user.role;
    try {
        const user = await User.findByPk(req.params.user_id);
        if (!user) {
            return res.status(404).json({ message: req.t('user.notFound') });
        }
        const isAdmin = role === ROLES.ADMIN;
        const isOwner = user.user_id === user_id;
        if (isAdmin || isOwner) {
            const { user_name, password, email, role, status, osu_uid, avatar, qq, discord } = req.body;
            if (password){
                const hashedPassword = await bcrypt.hash(password, 10);
                await user.update({ user_name, password: hashedPassword, email, role, status, osu_uid, avatar, qq, discord });
            } else {
                await user.update({ user_name, email, role, status, osu_uid, avatar, qq, discord });
            }
            res.status(200).json({ message: req.t('user.updateSuccess') });
        } else {
            res.status(403).json({ message: req.t('user.noPermission') });
        }
    } catch (err) {
        res.status(500).json({ message: req.t('user.updateFailed') });
    }
};

// 删除用户
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.user_id);
        if (!user) {
            return res.status(404).json({ message: req.t('user.notFound') });
        }
        await user.destroy();
        res.status(200).json({ message: req.t('user.deleteSuccess') });
    } catch (err) {
        res.status(500).json({ message: req.t('user.deleteFailed') });
    }
};

// 根据token获取用户信息
const getUserInfo = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const user = await User.findByPk(user_id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return res.status(404).json({ message: req.t('user.notFound') });
        }
        res.status(200).json({ data: user });
    } catch (error) {}
}

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserInfo,
};
