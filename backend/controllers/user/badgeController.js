const { Badge, HomeImg} = require('../../models');
const upload = require('../../config/multer')
const mc = require('../../config/minio')
const fs = require('fs')
const sequelize = require('../../config/db')

// 上传牌子
exports.uploadBadge = [
    upload.imageUpload.single('file'),
    async (req, res) => {
        const { name, redirect_url } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: req.t('badge.fileMissing') });
        }

        const filePath = file.path;
        const fileName = file.filename;
        const fileUrl = `${process.env.MINIO_BADGES_BUCKET}/${fileName}`;

        try {
            await mc.fPutObject(process.env.MINIO_BADGES_BUCKET, fileName, filePath, {
                'Content-Type': file.mimetype,
            })

            await Badge.create({
                name: name,
                url: fileUrl,
                redirect_url: redirect_url,
                minio_img_name: fileName,
            });

            fs.unlinkSync(filePath);

            res.status(201).json({ message: req.t('badge.uploadSuccess') })
        } catch (error) {
            // 如果上传失败，删除临时文件
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            res.status(500).json({ message: req.t('badge.uploadFailed') });
        }
    }
]

// 处理badge预签名
const preSign = async (name) => {
    const expires = 24 * 60 * 60;
    return await mc.presignedUrl('GET', process.env.MINIO_BADGES_BUCKET, name, expires)
}

// 获取牌子列表（管理系统用）
exports.getAllBadges = async (req, res) => {
    const { page, pageSize } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    try {
        const { count, rows } = await Badge.findAndCountAll({
            limit,
            offset,
            distinct: true,
            attributes: { exclude: ['url'] },
        });

        const signBadge = rows.map(async (badge) => {
            const signedUrl = await preSign(badge.minio_img_name);
            const badgeData = badge.toJSON();
            delete badgeData.minio_img_name;
            badgeData.signedUrl = signedUrl;
            return badgeData;
        }) ;

        const signedBadges = await Promise.all(signBadge);

        const totalPages = Math.ceil(count / limit)
        res.status(200).json({
            data: signedBadges,
            page: parseInt(page, 10),
            pageSize: limit,
            total: count,
            totalPages: totalPages
        });
    } catch (error) {
        res.status(500).json({ message: req.t('badge.getFailed') });
    }
}

// 在牌子中添加拥有者
exports.addUsersToBadge = async (req, res) => {
    const badgeId = req.params.id;
    const { userIds } = req.body;
    if (!badgeId || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: req.t('badge.invalidParams') });
    }
    const t = await sequelize.transaction();
    try {
        const badge = await Badge.findByPk(badgeId, { transaction: t });
        if (!badge) {
            await t.rollback();
            return res.status(404).json({ message: req.t('badge.notFound') });
        }
        await badge.addUsers(userIds, { transaction: t });
        await t.commit();
        res.status(200).json({ message: req.t('badge.grantSuccess') });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: req.t('badge.grantFailed') });
    }
}