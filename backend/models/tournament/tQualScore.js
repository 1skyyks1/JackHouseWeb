const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const TQualScore = sequelize.define('TQualScore', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    map_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '资格赛图id'
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '队伍id'
    },
    player_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '选手id'
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '分数'
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
}, {
    tableName: 't_qual_score',
    timestamps: false
});

module.exports = TQualScore;
