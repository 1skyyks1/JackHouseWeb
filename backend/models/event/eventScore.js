const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const EventScore = sequelize.define('EventScore', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '成绩ID'
    },
    stage_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '项目ID'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID'
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '分数'
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
    },
    updated_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '更新时间'
    }
},{
    tableName: 'event_score',
    timestamps: true,
    createdAt: 'created_time',
    updatedAt: 'updated_time',
})

module.exports = EventScore;