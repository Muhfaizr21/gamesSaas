const { DataTypes } = require('sequelize');
const masterSequelize = require('../config/masterDatabase');

const TenantDepositRequest = masterSequelize.define('TenantDepositRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    proofUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL bukti transfer jika ada'
    }
}, {
    tableName: 'tenant_deposit_requests',
    timestamps: true
});

module.exports = TenantDepositRequest;
