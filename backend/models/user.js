const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.INTEGER,
        defaultValue: 0,  // 默认角色为0（普通用户）
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,  // 默认为0（正常）
    },
    osu_uid: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: true,
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
    },
}, {
    tableName: 'user',  // 映射到数据库中的 'users' 表
    timestamps: false,
});

// 导出模型
module.exports = User;
