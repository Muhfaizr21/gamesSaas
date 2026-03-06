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
    prismalinkMerchantId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    prismalinkSecretKey: {
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
