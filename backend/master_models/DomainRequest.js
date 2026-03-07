const { DataTypes } = require('sequelize');
const masterSequelize = require('../config/masterDatabase');
const Tenant = require('./Tenant'); // Needs relation?

const DomainRequest = masterSequelize.define('DomainRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    domain: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active'),
        defaultValue: 'pending'
    },
    providerRecords: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array of DNS records they need to set'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'domain_requests',
    timestamps: true
});

DomainRequest.belongsTo(Tenant, { foreignKey: 'tenantId' });
Tenant.hasMany(DomainRequest, { foreignKey: 'tenantId' });

module.exports = DomainRequest;
