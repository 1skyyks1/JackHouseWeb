const { User, PostFile, Post } = require('../models/index')
const {PostComment} = require("../models");
const {or} = require("sequelize");

// 获取指定帖子的所有投稿
exports.getFileByPostId = async (req, res) => {
    const { post_id } = req.params;
    const { page, pageSize } = req.query
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    try {
        const { count, rows} = await PostFile.findAndCountAll({
            where: { post_id },
            limit,
            offset,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_name', 'role']
                }
            ]
        });

        const result = rows.map(file => {
            const fileData = file.toJSON();
            fileData.user_name = fileData.user.user_name;
            fileData.role = fileData.user.role;
            delete fileData.user;
            return fileData;
        })
        const totalPages = Math.ceil(count / limit)
        res.json({ data: result, page: parseInt(page, 10), pageSize: limit, totalPages, total: count });
    } catch (error){
        res.status(500).json({ message: '获取投稿失败', error });
    }
}

// 获取指定用户的所有投稿
exports.getFileByUserId = async (req, res) => {
    const { user_id } = req.params;
    const { page, pageSize } = req.query
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    try {
        const { count, rows } = await PostFile.findAndCountAll({
            where: { user_id },
            limit,
            offset,
        });
        const totalPages = Math.ceil(count / limit)
        res.json({ data: rows, page: parseInt(page, 10), pageSize: limit, totalPages, total: count });
    } catch (error){
        res.status(500).json({ message: '获取投稿失败', error });
    }
}

// 获取所有帖子所有投稿
exports.getAllPostFiles = async (req, res) => {
    const { page, pageSize } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    try {
        const { count, rows } = await PostFile.findAndCountAll({
            limit,
            offset,
        });
        const totalPages = Math.ceil(count / limit);
        res.json({ data: rows, page: parseInt(page, 10), pageSize: limit, totalPages, total: count });
    } catch (error) {
        res.status(500).json({ message: '获取投稿失败', error });
    }
};

// 上传投稿
exports.createPostFile = async (req, res) => {
    const { post_id, user_id, file_name, file_url, status } = req.body;
    try {
        await PostFile.create({
            post_id,
            user_id,
            file_name,
            file_url,
            status
        });
        res.status(201).json({ message: '上传成功' })
    } catch (error) {
        res.status(500).json({ message: '上传失败', error });
    }
}

// 更新投稿
exports.updatePostFile = async (req, res) => {
    const { file_name, file_url, status } = req.body;
    try {
        const originalPostFile = await PostFile.findByPk(req.params.file_id);
        if(!originalPostFile) {
            return res.status(404).json({ message: '投稿不存在' });
        }
        await originalPostFile.update({ file_name, file_url, status });
        res.status(200).json({ message: '投稿更新成功'});
    } catch (err) {
        res.status(500).json({ message: '更新失败', error: err.message });
    }
}

// 删除投稿
exports.deletePostFile = async (req, res) => {
    const { file_id } = req.params;
    try {
        const file = await PostFile.findByPk(file_id);
        if (!file) {
            return res.status(404).json({ message: '投稿不存在' });
        }
        await file.destroy();
        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除失败', error });
    }
};