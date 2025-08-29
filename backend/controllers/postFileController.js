const { User, PostFile, Post } = require('../models/index')
const mc = require('../config/minio')
const fs = require('fs')
const path = require('path')
const upload = require('../config/multer')
const ROLES = require('../config/roles')
const sequelize = require('../config/db')

// 获取指定帖子的所有投稿
exports.getFileByPostId = async (req, res) => {
    const { post_id } = req.params;
    const { page, pageSize } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    try {
        const { count, rows } = await PostFile.findAndCountAll({
            where: { post_id },
            limit,
            offset,
            order: [['uploaded_time', 'DESC']],
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
        res.status(500).json({ message: req.t('postFile.getFailed') });
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
            order: [['uploaded_time', 'DESC']],
            limit,
            offset,
        });
        const totalPages = Math.ceil(count / limit)
        res.json({ data: rows, page: parseInt(page, 10), pageSize: limit, totalPages, total: count });
    } catch (error){
        res.status(500).json({ message: req.t('postFile.getFailed') });
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
            order: [['uploaded_time', 'DESC']],
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
        const totalPages = Math.ceil(count / limit);
        res.json({ data: result, page: parseInt(page, 10), pageSize: limit, totalPages, total: count });
    } catch (error) {
        res.status(500).json({ message: req.t('postFile.getFailed') });
    }
};

// 创建投稿
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
        res.status(201).json({ message: req.t('postFile.createSuccess') })
    } catch (error) {
        res.status(500).json({ message: req.t('postFile.createFailed') });
    }
}

// 上传投稿
exports.uploadPostFile = [
    upload.upload.single('file'),
    async (req, res) => {
        const { post_id, status } = req.body;
        const user_id = req.user.user_id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: req.t('postFile.noFile') });
        }

        const filePath = file.path;
        const fileName = file.filename;
        const fileUrl = `${process.env.MINIO_POSTFILES_BUCKET}/${fileName}`;

        try {
            // 上传文件到 MinIO
            await mc.fPutObject(process.env.MINIO_POSTFILES_BUCKET, fileName, filePath, {
                'Content-Type': file.mimetype,
            });

            // 将文件信息保存到数据库
            const postFile = await PostFile.create({
                post_id,
                user_id,
                file_name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
                minio_file_name: fileName,
                file_url: fileUrl,
                status,
            });

            // 删除临时文件
            fs.unlinkSync(filePath);

            res.status(201).json({ message: req.t('postFile.uploadSuccess'), data: postFile });
        } catch (error) {
            // 如果上传失败，删除临时文件
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            res.status(500).json({ message: req.t('postFile.uploadFailed') });
        }
    }
];

// MinIO预签名 文件url
exports.postFileUrl = async (req, res) => {
    const expires = 24 * 60 * 60;
    const { file_id } = req.params;
    try{
        const postFile = await PostFile.findByPk(file_id);
        if(!postFile) {
            return res.status(404).json({ message: req.t('postFile.notFound') });
        }
        const fileName = postFile.minio_file_name;

        const fileUrl = await mc.presignedUrl('GET', process.env.MINIO_POSTFILES_BUCKET, fileName, expires)
        res.status(200).json({ data: { fileUrl } })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('postFile.getUrlFailed') });
    }
}


// 更新投稿
exports.updatePostFile = async (req, res) => {
    const { file_name, file_url } = req.body;
    const { file_id } = req.params;
    try {
        const originalPostFile = await PostFile.findByPk(file_id);
        if(!originalPostFile) {
            return res.status(404).json({ message: req.t('postFile.notFound') });
        }
        await originalPostFile.update({ file_name, file_url });
        res.status(200).json({ message: req.t('postFile.updateSuccess') });
    } catch (err) {
        res.status(500).json({ message: req.t('postFile.updateFailed') });
    }
}

// 审核投稿
exports.reviewPostFile = async (req, res) => {
    const { status, feedback } = req.body;
    const { file_id } = req.params;
    try {
        const originalPostFile = await PostFile.findByPk(file_id);
        if(!originalPostFile) {
            return res.status(404).json({ message: req.t('postFile.notFound') });
        }
        await originalPostFile.update({ status, feedback });
        res.status(200).json({ message: req.t('postFile.reviewSuccess') });
    } catch (err) {
        res.status(500).json({ message: req.t('postFile.updateFailed') });
    }
}

// 删除投稿
exports.deletePostFile = async (req, res) => {
    const { file_id } = req.params;
    const user_id = req.user.user_id;
    const role = req.user.role;
    try {
        const file = await PostFile.findByPk(file_id);
        if (!file) {
            return res.status(404).json({ message: req.t('postFile.notFound') });
        }
        const isAdmin = (role === ROLES.ADMIN || role === ROLES.ORG);
        const isOwner = file.user_id === user_id;
        const isPending = isOwner && file.status === 0

        if (!isAdmin) {
            return res.status(403).json({ message: req.t('postFile.deleteForbidden') });
        }

        if (!isPending) {
            return res.status(403).json({ message: req.t('postFile.deleteNotPending') });
        }

        await sequelize.transaction(async (t) => {
            await file.destroy({ transaction: t });
            await mc.removeObject(process.env.MINIO_POSTFILES_BUCKET, file.minio_file_name);
        })
        res.json({ message: req.t('postFile.deleteSuccess') });

    } catch (error) {
        res.status(500).json({ message: req.t('postFile.deleteFailed') });
    }
};