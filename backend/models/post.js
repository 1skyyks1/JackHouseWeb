const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Post = sequelize.define('Post', {
    post_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '帖子ID',
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '帖主ID',
    },
    type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '帖子类型（0=普通帖子，1=征稿，2=活动，3=公告）',
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: '创建时间',
    },
    updated_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
        comment: '更新时间',
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
        comment: '征稿帖的状态（0=征稿中，1=结束）',
    },
}, {
    tableName: 'post',
    timestamps: false,
});


module.exports = Post;
