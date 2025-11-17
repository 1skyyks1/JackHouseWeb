const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Role = sequelize.define('role', {
    role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    role_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    minio_img_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    created_time: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'role',
    timestamps: false,
})

module.exports = Role;