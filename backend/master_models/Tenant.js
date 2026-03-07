const { DataTypes } = require('sequelize');
const masterSequelize = require('../config/masterDatabase');
const TenantConfig = require('./TenantConfig');

const Tenant = masterSequelize.define('Tenant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subdomain: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'e.g., store_alfian -> store_alfian.samstore.id'
    },
    customDomain: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    dbName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Database Name in MySQL e.g. tenant_store_alfian'
    },
    dbUser: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'root'
    },
    dbPass: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'root'
    },
    adminName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    adminEmail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    adminWhatsapp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'suspended', 'trial'),
        defaultValue: 'active',
    },
    balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Saldo deposit reseller yang mengendap di superadmin'
    },
    planId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Foreign key to SaaSPlan'
    },
    subscriptionExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Tanggal berakhirnya paket SaaS. Null = trial/free'
    }
}, {
    tableName: 'tenants',
    timestamps: true
});

const SaaSPlan = require('./SaaSPlan');
const TenantDepositRequest = require('./TenantDepositRequest');

// Relasi 1-to-1: 1 Tenant punya 1 Config Rahasia (API Keys)
Tenant.hasOne(TenantConfig, { foreignKey: 'tenantId' });
TenantConfig.belongsTo(Tenant, { foreignKey: 'tenantId' });

// Relasi ke SaaS Plan
Tenant.belongsTo(SaaSPlan, { foreignKey: 'planId', as: 'plan' });

// Relasi Deposit
Tenant.hasMany(TenantDepositRequest, { foreignKey: 'tenantId', as: 'depositRequests' });
TenantDepositRequest.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

module.exports = Tenant;
