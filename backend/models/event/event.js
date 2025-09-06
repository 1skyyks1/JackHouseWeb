const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '活动ID'
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "活动名",
    },
    desc: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "描述",
    },
    start: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '开始时间',
    },
    end: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '结束时间',
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '上传时间'
    },
    updated_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '更新时间'
    }
},{
    tableName: 'event',
    timestamps: true,
    createdAt: 'created_time',
    updatedAt: 'updated_time',
})

module.exports = Event;