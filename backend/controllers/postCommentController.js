const { PostComment, User} = require('../models/index');

// 获取指定帖子的所有评论
exports.getCommentsByPostId = async (req, res) => {
    const { post_id } = req.params;
    try {
        const comments = await PostComment.findAll({
            where: { post_id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_name', 'role']
                }
            ]
        });

        const result = comments.map(comment => {
            const commentData = comment.toJSON();
            commentData.user_name = commentData.user.user_name;
            commentData.role = commentData.user.role;
            delete commentData.user;
            return commentData
        })

        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ message: '获取评论失败', error });
    }
};

// 获取所有帖子所有评论
exports.getAllComments = async (req, res) => {
    try {
        const comment = await PostComment.findAll();
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: '获取评论失败', error });
    }
};

// 获取指定用户的所有投稿
exports.getCommentsByUserId = async (req, res) => {
    const { user_id } = req.params;
    try {
        const comment = await PostComment.findAll({
            where: { user_id },
        });
        res.json({ data: comment });
    } catch (error){
        res.status(500).json({ message: '获取评论失败', error });
    }
}


// 创建评论
exports.createComment = async (req, res) => {
    const { post_id, user_id, comment } = req.body;
    try {
        const newComment = await PostComment.create({
            post_id,
            user_id,
            comment,
        });
        res.status(201).json({ message: '创建评论成功' });
    } catch (error) {
        res.status(500).json({ message: '创建评论失败', error });
    }
};

// 更新评论
exports.updateComment = async (req, res) => {
    const { comment_id } = req.params;
    const { comment } = req.body;
    try {
        const existingComment = await PostComment.findByPk(comment_id);
        if (!existingComment) {
            return res.status(404).json({ message: '评论不存在' });
        }
        existingComment.comment = comment || existingComment.comment;
        await existingComment.save();
        res.json({ data: existingComment });
    } catch (error) {
        res.status(500).json({ message: '更新评论失败', error });
    }
};

// 删除评论
exports.deleteComment = async (req, res) => {
    const { comment_id } = req.params;
    try {
        const comment = await PostComment.findByPk(comment_id);
        if (!comment) {
            return res.status(404).json({ message: '评论不存在' });
        }
        await comment.destroy();
        res.json({ message: '评论删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除评论失败', error });
    }
};
