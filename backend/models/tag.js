const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tag = sequelize.define('Tag', {
    tag_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '标签ID',
    },
    tag_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: '标签名'
    },
}, {
    tableName: 'tag',
    timestamps: false,
});

module.exports = Tag;