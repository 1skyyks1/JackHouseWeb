const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Badge = sequelize.define('Badge', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '图片链接',
    },
    minio_img_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'minio侧文件名'
    },
    redirect_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '跳转链接',
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
    tableName: 'badge',
    timestamps: true,
    createdAt: 'created_time',
    updatedAt: 'updated_time',
});

module.exports = Badge;