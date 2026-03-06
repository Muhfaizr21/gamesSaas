module.exports = (sequelize, DataTypes) => {
    /**
     * SavingPot — Kantong tabungan keuangan bisnis.
     * 
     * 3 pot default (akuntansi):
     *   1. operational  — Dana Operasional (OPEX): server, tools, gaji
     *   2. marketing    — Dana Pemasaran: promo, flash sale, diskon, cashback
     *   3. retained     — Laba Ditahan: simpanan jangka panjang, modal ekspansi
     */
    const SavingPot = sequelize.define('SavingPot', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Nama kantong, misal: Dana Operasional'
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            comment: 'operational | marketing | retained'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Keterangan penggunaan dana'
        },
        allocation_percent: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 33.33,
            comment: 'Persentase profit yang masuk ke pot ini (total ketiga = 100%)'
        },
        balance: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Saldo saat ini dalam Rupiah'
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Warna untuk UI, misal: blue, green, purple'
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Nama ikon lucide-react'
        }
    }, {
        tableName: 'saving_pots',
        timestamps: true
    });

    return SavingPot;
};
