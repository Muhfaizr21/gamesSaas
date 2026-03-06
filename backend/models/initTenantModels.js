const { DataTypes } = require('sequelize');

function initTenantModels(sequelize) {
    const models = {
        User: require('./User')(sequelize, DataTypes),
        Category: require('./Category')(sequelize, DataTypes),
        Voucher: require('./Voucher')(sequelize, DataTypes),
        Product: require('./Product')(sequelize, DataTypes),
        Order: require('./Order')(sequelize, DataTypes),
        Deposit: require('./Deposit')(sequelize, DataTypes),
        Article: require('./Article')(sequelize, DataTypes),
        Setting: require('./Setting')(sequelize, DataTypes),
        BankAccount: require('./BankAccount')(sequelize, DataTypes),
        Review: require('./Review')(sequelize, DataTypes),
        Promo: require('./Promo')(sequelize, DataTypes),
        PromoCode: require('./PromoCode')(sequelize, DataTypes),
        SpinPrize: require('./SpinPrize')(sequelize, DataTypes),
        SavingPot: require('./SavingPot')(sequelize, DataTypes),
        SavingTransaction: require('./SavingTransaction')(sequelize, DataTypes),
    };

    // Jalankan sinkronisasi relasi antar tabel (Associations)
    Object.keys(models).forEach(modelName => {
        if (models[modelName].associate) {
            models[modelName].associate(models);
        }
    });

    // Tempelkan daftar model ke instance sequelize
    sequelize.models = models;

    return models;
}

module.exports = initTenantModels;
