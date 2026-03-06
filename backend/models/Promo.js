module.exports = (sequelize, DataTypes) => {
    const Promo = sequelize.define('Promo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Nama promo misal Flash Sale Weekend'
        },
        discount_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            comment: 'Persentase diskon'
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        target_slug: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Slug produk target flash sale. Jika null berlaku untuk semua.'
        },
        banner_url: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'URL gambar banner webp promo'
        }
    }, {
        timestamps: true,
    });

    return Promo;
};
