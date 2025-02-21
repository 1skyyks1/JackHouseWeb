const { User, Post} = require('../models/index');  // 引入 User 模型
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// 创建用户
const createUser = async (req, res) => {
    try {
        const { user_name, password, email, role, status, osu_uid, avatar } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ user_name, password: hashedPassword, email, role, status, osu_uid, avatar });
        res.status(201).json({ message: '用户创建成功' });
    } catch (err) {
        res.status(500).json({ message: '创建用户失败', error: err.message });
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
                [Op.like]: `%${search}%`  // 使用 Op.like 进行模糊搜索
            };
        }
        const { count, rows } = await User.findAndCountAll(
            {
                attributes: { exclude: ['password'] } ,
                where: whereCondition,
                offset,
                limit
            }
        );
        const totalPages = Math.ceil(count / limit);
        res.status(200).json({ data: rows, page: parseInt(page, 10), pageSize: limit, totalPages, total: count });
    } catch (err) {
        res.status(500).json({ message: '获取用户列表失败', error: err.message });
    }
};

// 获取单个用户
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.user_id);
        if (!user) {
            return res.status(404).json({ message: '用户未找到' });
        }
        res.status(200).json({ data: user });
    } catch (err) {
        res.status(500).json({ message: '获取用户失败', error: err.message });
    }
};

// 更新用户
const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.user_id);
        if (!user) {
            return res.status(404).json({ message: '用户未找到' });
        }
        const { user_name, password, email, role, status, osu_uid, avatar } = req.body;
        if (password){
            const hashedPassword = await bcrypt.hash(password, 10);
            await user.update({ user_name, password: hashedPassword, email, role, status, osu_uid, avatar });
        } else {
            await user.update({ user_name, email, role, status, osu_uid, avatar });
        }
        res.status(200).json({ message: '用户信息更新成功', data: user });
    } catch (err) {
        res.status(500).json({ message: '更新用户信息失败', error: err.message });
    }
};

// 删除用户
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.user_id);
        if (!user) {
            return res.status(404).json({ message: '用户未找到' });
        }
        await user.destroy();
        res.status(200).json({ message: '用户删除成功' });
    } catch (err) {
        res.status(500).json({ message: '删除用户失败', error: err.message });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
};
