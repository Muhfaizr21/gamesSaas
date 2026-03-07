const { DataTypes } = require('sequelize');
const masterSequelize = require('../config/masterDatabase');

const PlatformSetting = masterSequelize.define('PlatformSetting', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'e.g. DIGIFLAZZ_USERNAME, GLOBAL_MARKUP_PERCENT, PRISMALINK_MERCHANT'
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    group: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'e.g. API_PROVIDER, PAYMENT_GATEWAY, MARKUP, THEME'
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'platform_settings',
    timestamps: true
});

module.exports = PlatformSetting;
