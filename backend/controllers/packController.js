const { Pack, Tag, User } = require('../models');
const sequelize = require('../config/db')
const { Op } = require('sequelize');

// 创建新图包
exports.createPack = async (req, res) => {
    const { title, creator, osuBID, url, tags, intro, type } = req.body;
    const user_id = req.user.user_id;

    if (!title || !Array.isArray(tags)) {
        return res.status(400).json({ message: req.t('pack.createMissing') });
    }

    const t = await sequelize.transaction();

    try {
        const pack = await Pack.create({
            title,
            creator,
            user_id,
            osu_bid: osuBID,
            other_url: url,
            intro,
            type
        }, { transaction: t });

        // 关联标签
        await pack.addTags(tags, { transaction: t });
        await t.commit();

        res.status(201).json({ data: pack });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: req.t('pack.createFailed') });
    }
};

// 获取图包列表（带筛选和分页）
exports.getAllPacks = async (req, res) => {
    const { page, pageSize, searchKeys ,tags, type } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    try {
        const findOptions = {
            distinct: true,
            limit,
            offset,
            order: [['created_time', 'DESC']],
            attributes: { exclude: ['user_id', 'intro'] },
            where: {},
            include: [
                {
                    model: Tag,
                    as: 'tags',
                    attributes: ['tag_id', 'tag_name'],
                    through: { attributes: [] }
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'user_name']
                }
            ]
        };

        if (searchKeys) {
            findOptions.where = {
                [Op.or]: [
                    { title: { [Op.like]: `%${searchKeys}%` } },
                    { creator: { [Op.like]: `%${searchKeys}%` } }
                ]
            };
        }

        if (type) {
            findOptions.where.type = Number(type);
        }

        if (tags) {
            const tagIdArray = Array.isArray(tags) ? tags.map(Number) : [Number(tags)];
            findOptions.include[0].where = { tag_id: { [Op.in]: tagIdArray } };
        }

        const { count, rows } = await Pack.findAndCountAll(findOptions);
        const totalPages = Math.ceil(count / limit)

        res.status(200).json({
            total: count,
            totalPages,
            pageSize: limit,
            page: parseInt(page, 10),
            data: rows
        });
    } catch (error) {
        res.status(500).json({ message: req.t('pack.getListFailed') });
    }
};

// 获取单个图包的详细信息
exports.getPackById = async (req, res) => {
    try {
        const pack = await Pack.findByPk(req.params.pack_id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'user_name', 'avatar']
                },
                {
                    model: Tag,
                    as: 'tags',
                    attributes: ['tag_id', 'tag_name'],
                    through: { attributes: [] }
                }
            ]
        });

        if (!pack) {
            return res.status(404).json({ message: req.t('pack.notFound') });
        }

        res.status(200).json({ data: pack });
    } catch (error) {
        res.status(500).json({ message: req.t('pack.getDetailFailed') });
    }
};