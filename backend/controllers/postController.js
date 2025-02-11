const { Post, PostTranslation } = require('../models/index');
const sequelize = require('../config/db')

// 获取所有帖子
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [
                {
                    model: PostTranslation,
                    as: 'translations',
                    attributes: ['title', 'language'],
                }
            ]
        });

        const result = posts.map(post => {
            const postData = post.toJSON();
            postData.title_zh = postData.translations.find(t => t.language === 'zh')?.title || null;
            postData.title_en = postData.translations.find(t => t.language === 'en')?.title || null;
            delete postData.translations;
            return postData;
        })
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: '获取帖子列表失败', error });
    }
};

// 获取单个帖子
exports.getPostById = async (req, res) => {
    const { post_id } = req.params;
    try {
        const post = await Post.findOne({
            where: { post_id },
            include: [
                {
                    model: PostTranslation,
                    as: 'translations',
                    attributes: ['title', 'content', 'language']
                }
            ]
        });
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ message: '帖子不存在' });
        }
    } catch (error) {
        res.status(500).json({ message: '获取帖子失败', error });
    }
};

// 创建帖子
exports.createPost = async (req, res) => {
    const { user_id, type, status, translations } = req.body;

    const t = await sequelize.transaction();

    try {
        const newPost = await Post.create({
            user_id,
            type,
            status: status || null,
        }, { transaction: t });

        for( const { language, title, content } of translations){
            await PostTranslation.create({
                post_id: newPost.post_id,
                language,
                title,
                content,
            },{ transaction: t });
        }
        await t.commit();
        res.status(201).json(newPost);
    } catch (error) {
        await t.rollback();
        console.error(error)
        res.status(500).json({ message: '创建帖子失败', error });
    }
};

// 更新帖子
exports.updatePost = async (req, res) => {
    const { post_id } = req.params;
    const { type, status, translations } = req.body;
    try {
        const existingPost = await Post.findOne({ where: { post_id } });
        if (!existingPost) {
            return res.status(404).json({ message: '帖子不存在' });
        }
        existingPost.type = type || existingPost.type;
        existingPost.status = status || existingPost.status;
        await existingPost.save();

        if (translations && Array.isArray(translations)) {
            for (const { language, title, content } of translations) {

                // 如果指定了语言，则更新相应语言的翻译
                if (language && (title || content)) {
                    const existingTranslation = await PostTranslation.findOne({
                        where: { post_id, language }
                    });

                    if (existingTranslation) {
                        // 更新已有的翻译
                        existingTranslation.title = title || existingTranslation.title;
                        existingTranslation.content = content || existingTranslation.content;
                        await existingTranslation.save();
                        console.log(existingTranslation)
                    } else {
                        // 如果没有找到该语言的翻译，创建新的翻译记录
                        await PostTranslation.create({
                            post_id,
                            language,
                            title,
                            content
                        });
                    }
                }
            }
        }

        res.json({ message: '帖子更新成功' });
    } catch (error) {
        res.status(500).json({ message: '更新帖子失败', error });
    }
};

// 删除帖子
exports.deletePost = async (req, res) => {
    const { post_id } = req.params;
    try {
        const post = await Post.findOne({ where: { post_id } });
        if (!post) {
            return res.status(404).json({ message: '帖子不存在' });
        }
        await post.destroy();
        res.json({ message: '帖子删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除帖子失败', error });
    }
};
