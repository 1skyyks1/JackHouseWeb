const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const TMappool = sequelize.define('TMappool', {
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
    type: {
        type: DataTypes.STRING(16),
        allowNull: false,
        comment: 'RC/LN/HB/SV/TB'
    },
    map_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'osu beatmap_id'
    },
    artist: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    mapper: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
}, {
    tableName: 't_mappool',
    timestamps: false
});

module.exports = TMappool;
