const { User, PostFile, Post } = require('../models/index')
const mc = require('../config/minio')
const fs = require('fs')
const path = require('path')
const upload = require('../config/multer')

// 获取指定帖子的所有投稿
exports.getFileByPostId = async (req, res) => {
    const { post_id } = req.params;
    const { page, pageSize } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    try {
        const { count, rows} = await PostFile.findAndCountAll({
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
            order: [['uploaded_time', 'DESC']],
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
            order: [['uploaded_time', 'DESC']],
        });
        const totalPages = Math.ceil(count / limit);
        res.json({ data: rows, page: parseInt(page, 10), pageSize: limit, totalPages, total: count });
    } catch (error) {
        res.status(500).json({ message: '获取投稿失败', error });
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
        res.status(201).json({ message: '上传成功' })
    } catch (error) {
        res.status(500).json({ message: '上传失败', error });
    }
}

// 上传投稿
exports.uploadPostFile = [
    upload.upload.single('file'),
    async (req, res) => {
        const { post_id, user_id, status } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: '没有文件上传' });
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
                file_name: file.originalname,
                minio_file_name: fileName,
                file_url: fileUrl,
                status,
            });

            // 删除临时文件
            fs.unlinkSync(filePath);

            res.status(201).json({ message: '文件上传成功', data: postFile });
        } catch (error) {
            // 如果上传失败，删除临时文件
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            res.status(500).json({ message: '文件上传失败', error: error.message });
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
            return res.status(404).json({ message: '投稿不存在' });
        }
        const fileName = postFile.minio_file_name;

        const fileUrl = await mc.presignedUrl('GET', process.env.MINIO_POSTFILES_BUCKET, fileName, expires)
        res.status(200).json({ data: { fileUrl } })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '获取投稿URL失败', error: error.message });
    }
}


// 更新投稿
exports.updatePostFile = async (req, res) => {
    const { file_name, file_url } = req.body;
    const { file_id } = req.params;
    try {
        const originalPostFile = await PostFile.findByPk(file_id);
        if(!originalPostFile) {
            return res.status(404).json({ message: '投稿不存在' });
        }
        await originalPostFile.update({ file_name, file_url, status });
        res.status(200).json({ message: '投稿更新成功'});
    } catch (err) {
        res.status(500).json({ message: '更新失败', error: err.message });
    }
}

// 审核投稿
exports.reviewPostFile = async (req, res) => {
    const { status } = req.body;
    const { file_id } = req.params;
    try {
        const originalPostFile = await PostFile.findByPk(file_id);
        if(!originalPostFile) {
            return res.status(404).json({ message: '投稿不存在' });
        }
        await originalPostFile.update({ status });
        res.status(200).json({ message: '投稿审核成功'});
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
        await mc.removeObject(process.env.MINIO_HOMEIMG_BUCKET, file.minio_file_name);
        await file.destroy();
        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除失败', error });
    }
};