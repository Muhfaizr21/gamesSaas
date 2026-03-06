module.exports = (sequelize, DataTypes) => {
    const BankAccount = sequelize.define('BankAccount', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bank_name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Nama bank, contoh: BCA, BRI, Mandiri, GoPay, OVO'
        },
        account_number: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Nomor rekening / nomor dompet digital'
        },
        account_name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Nama pemilik rekening'
        },
        bank_type: {
            type: DataTypes.ENUM('bank', 'ewallet'),
            defaultValue: 'bank',
            comment: 'Jenis: bank transfer atau e-wallet'
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Tampilkan rekening ini ke user atau tidak'
        },
        sort_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Urutan tampil'
        }
    }, {
        tableName: 'bank_accounts',
        timestamps: true
    });

    return BankAccount;
};
