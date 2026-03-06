module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define('Review', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_visible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Admin can hide inappropriate reviews'
        }
    }, {
        timestamps: true,
    });

    Review.associate = (models) => {
        Review.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
        models.User.hasMany(Review, { foreignKey: 'userId' });

        Review.belongsTo(models.Order, { foreignKey: 'orderId', as: 'Order' });
        models.Order.hasOne(Review, { foreignKey: 'orderId' });

        Review.belongsTo(models.Product, { foreignKey: 'productId', as: 'Product' });
        models.Product.hasMany(Review, { foreignKey: 'productId' });
    };

    return Review;
};
