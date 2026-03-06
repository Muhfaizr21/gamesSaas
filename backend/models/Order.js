module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        invoice_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        customer_id: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'ID Game / ID Player yang dimasukkan user',
        },
        zone_id: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Server / Zone ID jika ada',
        },
        customer_name: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Nama in-game player',
        },
        whatsapp_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Contoh: QRIS, OVO, TRANSFER_BCA'
        },
        payment_channel: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Kode channel pembayaran Prismalink'
        },
        payment_url: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'URL checkout untuk pembayaran Prismalink'
        },
        gateway_reference: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Reference ID yang diberikan Prismalink'
        },
        fee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Fee transaksi payment gateway'
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Total = price + fee'
        },
        promo_discount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            comment: 'Potongan dari diskon flash sale'
        },
        points_used: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Poin yang digunakan untuk diskon'
        },
        points_earned: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Poin yang didapat dari transaksi ini jika Success'
        },
        promo_code_used: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Kupon promo yang dipakai (jika ada)'
        },
        tickets_earned: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Jumlah tiket gacha yang didapat dari order ini'
        },
        payment_status: {
            type: DataTypes.ENUM('Unpaid', 'Paid', 'Failed', 'Refunded'),
            defaultValue: 'Unpaid',
        },
        order_status: {
            type: DataTypes.ENUM('Pending', 'Processing', 'Success', 'Failed'),
            defaultValue: 'Pending',
        },
        provider_order_id: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'ID Trx dari provider seperti DigiFlazz',
        }
    }, {
        timestamps: true,
        indexes: [
            { fields: ['user_id'] },           // Lookup orders by user (my-orders)
            { fields: ['payment_status'] },    // Filter by payment status
            { fields: ['order_status'] },      // Filter by order status
            { fields: ['created_at'] },         // Sort/range queries by date
            { fields: ['payment_status', 'order_status'] }, // Dashboard revenue calc
        ]
    });

    Order.associate = (models) => {
        // Associations
        models.Order.belongsTo(models.User, { foreignKey: 'userId', allowNull: true });
        models.User.hasMany(models.Order, { foreignKey: 'userId' });
        
        models.Order.belongsTo(models.Product, { foreignKey: 'productId' });
        models.Product.hasMany(models.Order, { foreignKey: 'productId' });
    };

    return Order;
};
