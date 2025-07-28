const { Tag } = require('../models/index');

// 获取所有标签
exports.getAllTags = async (req, res) => {
    try {
        const tags = await Tag.findAll({
            order: [['tag_id', 'ASC']],
        })
        res.status(200).json(tags);
    } catch (err) {
        res.status(500).json({ message: '获取标签列表失败', error: err.message });
    }
}