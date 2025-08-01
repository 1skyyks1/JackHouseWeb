const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Pack = sequelize.define('Pack', {
    pack_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: '图包ID'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: '图包名'
    },
    creator: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '图包作者'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '上传者ID'
    },
    osu_bid: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
        comment: 'osu上的图包id'
    },
    other_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '其他下载url'
    },
    intro: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '介绍'
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '上传时间'
    },
    updated_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '更新时间'
    },
},{
    tableName: 'pack',
    timestamps: true,
    createdAt: 'created_time',
    updatedAt: 'updated_time',
});

module.exports = Pack;