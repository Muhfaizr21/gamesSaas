const { DataTypes } = require('sequelize');
const masterSequelize = require('../config/masterDatabase');

const TenantConfig = masterSequelize.define('TenantConfig', {
    tenantId: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    digiflazzUsername: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    digiflazzKey: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tripayMerchantCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tripayApiKey: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tripayPrivateKey: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    markupPercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Global margin tiap toko dalam persen'
    }
}, {
    tableName: 'tenant_configs',
    timestamps: true
});

module.exports = TenantConfig;
