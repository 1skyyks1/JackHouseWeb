const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const TPlayer = sequelize.define('TPlayer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '队伍id'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用户id'
    },
    is_captain: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '是否队长'
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
}, {
    tableName: 't_player',
    timestamps: false
});

module.exports = TPlayer;
