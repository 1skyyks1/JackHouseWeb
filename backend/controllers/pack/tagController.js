const { Tag, Pack } = require('../../models');

// 获取所有标签
exports.getAllTags = async (req, res) => {
    try {
        const tags = await Tag.findAll({
            order: [['tag_id', 'ASC']],
        })
        res.status(200).json({ data: tags });
    } catch (err) {
        res.status(500).json({ message: req.t('tag.getFailed') });
    }
}

// 更新标签
exports.updateTags = async (req, res) => {
    const { tags } = req.body;
    const packId = req.params.pack_id;
    try {
        const pack = await Pack.findByPk(packId);
        await pack.setTags(tags);
        res.status(200).json({ message: req.t('tag.updateSuccess') });
    } catch (error) {
        res.status(500).json({ message: req.t('tag.updateFailed') });
    }
}