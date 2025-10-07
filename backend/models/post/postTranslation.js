const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const PostTranslation = sequelize.define('PostTranslation', {
    post_translation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    language: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'post_translation',
    timestamps: false,
});

module.exports = PostTranslation;
