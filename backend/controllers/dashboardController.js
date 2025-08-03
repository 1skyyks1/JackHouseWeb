const { User, Post } = require('../models/index');

exports.userAndPostCount = async (req, res) => {
    try {
        const postCount = await Post.count();
        const userCount = await User.count();
        res.status(200).json({ postCount: postCount, userCount: userCount });
    } catch (err) {
        res.status(500).json({ message: req.t('dashboard.getCountFailed') });
    }
}