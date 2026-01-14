const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Tournament = sequelize.define('Tournament', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '赛事正式名称'
    },
    acronym: {
        type: DataTypes.STRING(32),
        allowNull: false,
        comment: '赛事名称缩写'
    },
    desc: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '赛事简介'
    },
    banner: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '横幅图片'
    },
    team_size_min: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '队伍最少人数'
    },
    team_size_max: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
        comment: '队伍最大人数'
    },
    qual_top_n: {
        type: DataTypes.TINYINT,
        defaultValue: 32,
        comment: '资格赛前n晋级正赛'
    },
    qual_rank_mode: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        comment: '0=排名累加 1=加权分数'
    },
    reg_start: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '报名开始时间'
    },
    reg_end: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '报名结束时间'
    },
    qual_start: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '资格赛开始时间'
    },
    qual_end: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '资格赛结束时间'
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '0=未开始 1=报名中 2=资格赛 3=正赛 4=已结束'
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
    tableName: 'tournament',
    timestamps: true,
    createdAt: 'created_time',
    updatedAt: 'updated_time'
});

module.exports = Tournament;
