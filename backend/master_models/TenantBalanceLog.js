const { DataTypes } = require('sequelize');
const masterSequelize = require('../config/masterDatabase');
const Tenant = require('./Tenant'); // Needed to build relation

const TenantBalanceLog = masterSequelize.define('TenantBalanceLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('deposit', 'topup_deduct', 'fee', 'refund', 'manual_credit', 'manual_debit'),
        allowNull: false,
        comment: 'Tipe mutasi saldo'
    },
    balance_type: {
        type: DataTypes.ENUM('point', 'cash'),
        defaultValue: 'point',
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    balanceBefore: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    balanceAfter: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Reference invoice_number atau ID lain jika ada'
    }
}, {
    tableName: 'tenant_balance_logs',
    timestamps: true
});

Tenant.hasMany(TenantBalanceLog, { foreignKey: 'tenantId', as: 'balanceLogs' });
TenantBalanceLog.belongsTo(Tenant, { foreignKey: 'tenantId' });

module.exports = TenantBalanceLog;
