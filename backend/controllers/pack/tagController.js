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

// 更新某个图包的所有标签
exports.updatePackTags = async (req, res) => {
    const { tags } = req.body;
    const packId = req.params.pack_id;

    if (!Array.isArray(tags)) {
        return res.status(400).json({ message: req.t('tag.invalidTags') });
    }

    try {
        const pack = await Pack.findByPk(packId);
        if (!pack) {
            return res.status(404).json({ message: req.t('pack.notFound') });
        }
        await pack.setTags(tags);
        res.status(200).json({ message: req.t('tag.tagsUpdated') });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: req.t('tag.updateFailed') });
    }
};

// 从某个图包移除标签
exports.removeTagsFromPack = async (req, res) => {
    const { tag_ids } = req.body;
    const packId = req.params.pack_id;

    if (!Array.isArray(tag_ids) || tag_ids.length === 0) {
        return res.status(400).json({ message: req.t('pack.invalidTags') });
    }

    try {
        const pack = await Pack.findByPk(packId);
        if (!pack) {
            return res.status(404).json({ message: req.t('pack.notFound') });
        }
        await pack.removeTags(tag_ids);
        res.status(200).json({ message: req.t('pack.tagsRemoved') });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: req.t('pack.updateFailed') });
    }
};