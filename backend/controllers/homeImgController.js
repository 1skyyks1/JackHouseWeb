const { HomeImg } = require('../models/index')
const sequelize = require('../config/db')
const { Op } = require('sequelize');
const mc = require('../config/minio')
const fs = require('fs')
const upload = require('../config/multer')

// 获取头图列表（管理后台用）
exports.getAllHomeImg = async (req, res) => {
    const { page, pageSize } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    try{
        const { count, rows } = await HomeImg.findAndCountAll({
            limit,
            offset,
            distinct: true,
            order: [
                [
                    sequelize.literal(`
                        CASE 
                            WHEN sort_order = 1 THEN 1
                            WHEN sort_order = 2 THEN 2
                            WHEN sort_order = 3 THEN 3
                            ELSE 4
                        END
                    `), 'ASC'
                ],
                ['created_time', 'DESC'],
            ],
        });

        const totalPages = Math.ceil(count / limit)
        res.json({ data: rows, page: parseInt(page, 10), pageSize: limit, totalPages, total: count })
    } catch (error) {
        res.status(500).json({ message: '获取头图列表失败' })
    }
}

// 获取头图（首页使用）
exports.getHomeImg = async (req, res) => {
    try{
        const homeImgs = await HomeImg.findAll({
            where: {
                sort_order: {
                    [Op.in]: [1, 2, 3]
                }
            },
            order: [
                ['sort_order', 'ASC'],
                ['created_time', 'DESC']
            ]
        });

        const homeImgsPreSigned = await Promise.all(
            homeImgs.map(async (img) => {
                const signedUrl = await preSign(img.minio_img_name);
                return{
                    ...img.toJSON(),
                    signedUrl
                }
            })
        )

        res.json({ data: homeImgsPreSigned })
    } catch (error) {
        res.status(500).json({ message: '获取头图失败' });
    }
}

// 上传头图
exports.uploadHomeImg = [
    upload.imageUpload.single('file'),
    async (req, res) => {
        const { redirect_url, sort_order, description } = req.body;
        const user_id = req.user.user_id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: '没有图片上传' });
        }

        const filePath = file.path;
        const fileName = file.filename;
        const fileUrl = `${process.env.MINIO_HOMEIMG_BUCKET}/${fileName}`;

        try {
            // 上传文件到 MinIO
            await mc.fPutObject(process.env.MINIO_HOMEIMG_BUCKET, fileName, filePath, {
                'Content-Type': file.mimetype,
            });

            // 将文件信息保存到数据库
            const homeImg = await HomeImg.create({
                user_id,
                url: fileUrl,
                redirect_url,
                minio_img_name: fileName,
                sort_order,
                description
            });

            // 删除临时文件
            fs.unlinkSync(filePath);

            res.status(201).json({ message: '头图上传成功', data: homeImg });
        } catch (error) {
            // 如果上传失败，删除临时文件
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            res.status(500).json({ message: '头图上传失败' });
        }
    }
];

// 处理头图预签名
const preSign = async (name) => {
    const expires = 24 * 60 * 60;
    return await mc.presignedUrl('GET', process.env.MINIO_HOMEIMG_BUCKET, name, expires)
}

// 更新头图信息
exports.updateHomeImg = async (req, res) => {
    const { redirect_url, sort_order, description } = req.body;
    const { img_id } = req.params;
    try{
        const originalImg = await HomeImg.findByPk(img_id);
        if(!originalImg){
            return res.status(404).json({ message: '头图不存在' });
        }
        await originalImg.update({ redirect_url, sort_order, description })
        res.status(200).json({ message: '更新成功' });
    } catch (err) {
        res.status(500).json({ message: '更新失败' });
    }
}

// 删除头图
exports.deleteHomeImg = async (req, res) => {
    const { img_id } = req.params;
    try {
        const img = await HomeImg.findByPk(img_id);
        if (!img) {
            return res.status(404).json({ message: '头图不存在' });
        }
        await mc.removeObject(process.env.MINIO_HOMEIMG_BUCKET, img.minio_img_name);
        await img.destroy();
        res.json({ message: '删除成功' })
    } catch (error) {
        res.status(500).json({ message: '删除失败' });
    }
}