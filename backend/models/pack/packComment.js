const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const PackComment = sequelize.define('PackComment', {
    comment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '评论ID',
    },
    pack_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '关联的图包ID',
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '发表评论的用户ID',
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '评论内容',
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '评论时间',
    },
    updated_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '更新时间',
    }
}, {
    tableName: 'pack_comment',
    timestamps: true,
    createdAt: 'created_time',
    updatedAt: 'updated_time',
});

module.exports = PackComment;