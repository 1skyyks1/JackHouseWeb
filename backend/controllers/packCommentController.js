const { PackComment, Pack, User } = require('../models');

// 在图包下发表评论
exports.addComment = async (req, res) => {
    try {
        const { pack_id, content } = req.body;
        const user_id = req.user.user_id;
        if (!content) {
            return res.status(400).json({ message: '评论内容不能为空' });
        }

        const pack = await Pack.findByPk(pack_id);
        if (!pack) {
            return res.status(404).json({ message: '要评论的图包不存在' });
        }

        const newComment = await PackComment.create({
            pack_id,
            user_id,
            content
        });
        res.status(201).json({ message: '创建评论成功' });
    } catch (error) {
        res.status(500).json({ message: '发表评论失败' });
    }
};

// 查询图包评论
exports.getCommentsByPackId = async (req, res) => {
    try {
        const { pack_id } = req.params;
        const { page, pageSize } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
        const limit = parseInt(pageSize, 10);

        const { count, rows } = await PackComment.findAndCountAll({
            where: { pack_id },
            limit,
            offset,
            order: [['created_time', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['user_id', 'user_name', 'avatar']
            }]
        });

        const result = rows.map(comment => {
            const commentData = comment.toJSON();
            commentData.user_name = commentData.user.user_name;
            commentData.role = commentData.user.role;
            commentData.avatar = commentData.user.avatar
            delete commentData.user;
            return commentData
        })

        const totalPages = Math.ceil(count / limit)

        res.status(200).json({
            total: count,
            totalPages,
            pageSize: limit,
            page: parseInt(page, 10),
            data: result
        });

    } catch (error) {
        res.status(500).json({ message: '获取评论列表失败' });
    }
};