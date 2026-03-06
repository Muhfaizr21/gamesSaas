module.exports = (sequelize, DataTypes) => {
    /**
     * SavingTransaction — Log setiap aliran dana masuk/keluar per pot.
     * 
     * type: 'income'    — profit dari order sukses yang masuk ke pot
     *       'withdrawal'— penarikan untuk digunakan (promo, operasional, dll)
     */
    const SavingTransaction = sequelize.define('SavingTransaction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        saving_pot_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'saving_pots', key: 'id' }
        },
        type: {
            type: DataTypes.ENUM('income', 'withdrawal'),
            allowNull: false,
            defaultValue: 'income'
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            comment: 'Jumlah dalam Rupiah (selalu positif)'
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Keterangan: misal "Profit dari INV-001", "Bayar server Juni"'
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Referensi ke Order jika berasal dari transaksi'
        },
        order_invoice: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Nomor invoice untuk display tanpa join'
        }
    }, {
        tableName: 'saving_transactions',
        timestamps: true,
        indexes: [
            { fields: ['saving_pot_id'] },
            { fields: ['type'] },
            { fields: ['created_at'] }
        ]
    });

    SavingTransaction.associate = (models) => {
        // Associations
        models.SavingTransaction.belongsTo(models.SavingPot, { foreignKey: 'saving_pot_id', as: 'Pot' });
        models.SavingPot.hasMany(models.SavingTransaction, { foreignKey: 'saving_pot_id', as: 'Transactions' });
    };

    return SavingTransaction;
};
