const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const TMatch = sequelize.define('TMatch', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    round_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '轮次id'
    },
    mp_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'osu MP房间id'
    },
    team1_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '红队'
    },
    team2_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '蓝队'
    },
    team1_roll: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '红队roll点'
    },
    team2_roll: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '蓝队roll点'
    },
    team1_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '红队胜场'
    },
    team2_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '蓝队胜场'
    },
    winner_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '胜者队伍id'
    },
    is_possible: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: 'GF(P)标记'
    },
    scheduled_time: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '预定时间'
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '0=待开始 1=进行中 2=已结束'
    },
    team1_timeout_used: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
    },
    team2_timeout_used: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
}, {
    tableName: 't_match',
    timestamps: true,
    createdAt: 'created_time',
    updatedAt: 'updated_time'
});

module.exports = TMatch;
