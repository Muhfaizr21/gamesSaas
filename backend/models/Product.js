module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            comment: 'SKU from DigiFlazz for integration',
        },
        price_buy: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Harga modal dari provider',
        },
        price_sell: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Harga jual ke pengguna',
        },
        price_reseller: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Harga khusus reseller/member',
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
            comment: '-1 means unlimited',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        timestamps: true,
        indexes: [
            { fields: ['is_active'] },           // Public product listing filter
            { fields: ['voucher_id'] },           // Products by voucher/brand
            { fields: ['is_active', 'voucher_id'] }, // Active products per brand
            { fields: ['price_sell'] },          // Sorting by price
        ]
    });

    Product.associate = (models) => {
        // Associations
        models.Product.belongsTo(models.Voucher, { foreignKey: 'voucherId' });
        models.Voucher.hasMany(models.Product, { foreignKey: 'voucherId' });
    };

    return Product;
};
