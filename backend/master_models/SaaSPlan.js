const { DataTypes } = require('sequelize');
const masterSequelize = require('../config/masterDatabase');

const SaaSPlan = masterSequelize.define('SaaSPlan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'e.g., Starter, Pro, Enterprise'
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    durationDays: {
        type: DataTypes.INTEGER,
        defaultValue: 30, // 30 days / month
    },
    features: {
        type: DataTypes.TEXT, // Store JSON string array of features
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'saas_plans',
    timestamps: true
});

module.exports = SaaSPlan;
