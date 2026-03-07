const { DataTypes } = require('sequelize');
const masterSequelize = require('../config/masterDatabase');
const Tenant = require('./Tenant'); // optional relation

const BroadcastMessage = masterSequelize.define('BroadcastMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    level: {
        type: DataTypes.ENUM('info', 'warning', 'critical'),
        defaultValue: 'info'
    },
    targetAudience: {
        type: DataTypes.STRING, // 'all', or specific tenantIds
        defaultValue: 'all'
    },
    targetTenantId: {
        type: DataTypes.UUID, // If only to a specific tenant
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'broadcast_messages',
    timestamps: true
});

module.exports = BroadcastMessage;
