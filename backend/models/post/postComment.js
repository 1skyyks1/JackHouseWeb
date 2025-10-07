// models/PostComment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // 引入数据库配置

const PostComment = sequelize.define('PostComment', {
    comment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'post_comment',
    timestamps: false,
});

module.exports = PostComment;
