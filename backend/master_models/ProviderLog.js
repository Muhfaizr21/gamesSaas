const { DataTypes } = require('sequelize');
const masterSequelize = require('../config/masterDatabase');

const ProviderLog = masterSequelize.define('ProviderLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    providerName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'e.g., digiflazz, prismalink'
    },
    eventType: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'e.g., webhook, callback, order_status'
    },
    payload: {
        type: DataTypes.TEXT, // Using TEXT since Sequelize JSON support varies by dialect though MySQL 5.7+ supports it
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'success, failed, invalid_signature'
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'provider_logs',
    timestamps: true
});

module.exports = ProviderLog;
