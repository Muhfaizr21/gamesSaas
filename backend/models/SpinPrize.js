module.exports = (sequelize, DataTypes) => {
    const SpinPrize = sequelize.define('SpinPrize', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('points', 'promo', 'zonk'),
            allowNull: false,
            defaultValue: 'zonk'
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Jumlah poin atau persentase promo'
        },
        chance_weight: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10,
            comment: 'Bobot probabilitas munculnya hadiah ini saat gacha'
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'spin_prizes',
        timestamps: true
    });

    return SpinPrize;
};
