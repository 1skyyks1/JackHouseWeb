const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const TTeam = sequelize.define('TTeam', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    t_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '赛事id'
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '原始队名'
    },
    display_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '赛时使用名'
    },
    invite_code: {
        type: DataTypes.STRING(8),
        allowNull: true,
        unique: true,
        comment: '邀请码'
    },
    captain_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '队长user_id'
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '0=待审核 1=已通过 2=未通过'
    },
    qual_mp_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '资格赛MP房间id'
    },
    qual_rank: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '资格赛排名'
    },
    qual_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '资格赛总分'
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
    tableName: 't_team',
    timestamps: true,
    createdAt: 'created_time',
    updatedAt: 'updated_time'
});

module.exports = TTeam;
