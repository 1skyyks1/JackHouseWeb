const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const TQualMappool = sequelize.define('TQualMappool', {
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
    index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'stage编号 1-7'
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
    weight: {
        type: DataTypes.FLOAT,
        defaultValue: 1.0,
        comment: '权重'
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
}, {
    tableName: 't_qual_mappool',
    timestamps: false
});

module.exports = TQualMappool;
