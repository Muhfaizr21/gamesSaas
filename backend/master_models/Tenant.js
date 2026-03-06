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
    status: {
        type: DataTypes.ENUM('active', 'suspended', 'trial'),
        defaultValue: 'active',
    }
}, {
    tableName: 'tenants',
    timestamps: true
});

// Relasi 1-to-1: 1 Tenant punya 1 Config Rahasia (API Keys)
Tenant.hasOne(TenantConfig, { foreignKey: 'tenantId' });
TenantConfig.belongsTo(Tenant, { foreignKey: 'tenantId' });

module.exports = Tenant;
