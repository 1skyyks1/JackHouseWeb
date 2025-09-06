const Post = require('../models/post');
const PostTranslation = require('../models/postTranslation');
const PostFile = require('../models/postFile');
const PostComment = require('../models/postComment');
const User = require('../models/user');
const HomeImg = require('../models/homeImg')
const Pack = require('../models/pack');
const Tag = require('../models/tag');
const PackComment = require('../models/packComment');

const Event = require('../models/event/event');
const EventStage = require('../models/event/eventStage');
const EventScore = require('../models/event/eventScore');

Post.hasMany(PostTranslation, { foreignKey: 'post_id', onDelete: 'CASCADE', as: 'translations' });
Post.hasMany(PostFile, { foreignKey: 'post_id', onDelete: 'CASCADE', as: 'files' });
Post.hasMany(PostComment, { foreignKey: 'post_id', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

PostComment.belongsTo(Post, { foreignKey: 'post_id' });
PostComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

PostFile.belongsTo(Post, { foreignKey: 'post_id' });
PostFile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

PostTranslation.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

User.hasMany(Post, { foreignKey: 'user_id', onDelete: 'CASCADE' })
User.hasMany(PostFile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(PostComment, { foreignKey: 'user_id', onDelete: 'CASCADE' })
User.hasMany(HomeImg, { foreignKey: 'user_id', onDelete: 'CASCADE' })
User.hasMany(Pack, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(EventScore, { foreignKey: 'user_id', onDelete: 'CASCADE' });

HomeImg.belongsTo(User, {foreignKey: 'user_id'})

Pack.belongsToMany(Tag, {
    through: 'pack_tags',
    foreignKey: 'pack_id',
    otherKey: 'tag_id',
    as: 'tags'
})
Pack.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Pack.hasMany(PackComment, { foreignKey: 'pack_id' });

Tag.belongsToMany(Pack, {
    through: 'pack_tags',
    foreignKey: 'tag_id',
    otherKey: 'pack_id',
    as: 'packs'
})

PackComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
PackComment.belongsTo(Pack, { foreignKey: 'pack_id' });

Event.hasMany(EventStage, { foreignKey: 'event_id', onDelete: 'CASCADE', as: 'stage' });

EventStage.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });
EventStage.hasMany(EventScore, { foreignKey: 'stage_id', onDelete: 'CASCADE', as: 'score' });

EventScore.belongsTo(EventStage, { foreignKey: 'stage_id' , as: 'stage' });
EventScore.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
    Post,
    PostTranslation,
    PostFile,
    PostComment,
    User,
    HomeImg,
    Pack,
    Tag,
    PackComment,
    Event,
    EventStage,
    EventScore
};