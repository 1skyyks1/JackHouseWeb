const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const TRound = sequelize.define('TRound', {
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
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: '轮次名 RO32/RO16/QF/SF/F/GF'
    },
    bracket_type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '0=胜者组 1=败者组'
    },
    first_to: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '先到几分获胜'
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '轮次顺序'
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
}, {
    tableName: 't_round',
    timestamps: false
});

module.exports = TRound;
