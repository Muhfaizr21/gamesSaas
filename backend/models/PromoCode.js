module.exports = (sequelize, DataTypes) => {
    const PromoCode = sequelize.define('PromoCode', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        discount_type: {
            type: DataTypes.ENUM('percentage', 'fixed'),
            allowNull: false,
            defaultValue: 'fixed'
        },
        discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        max_discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Maksimal Potongan jika tipe percentage'
        },
        min_purchase: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        quota: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        used: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'promo_codes',
        timestamps: true
    });

    return PromoCode;
};
