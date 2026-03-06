module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: 'email_unique_idx'
        },
        whatsapp: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'whatsapp_unique_idx'
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('member', 'gold', 'platinum', 'writer', 'admin'),
            defaultValue: 'member'
        },
        balance: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        points: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Poin loyalty user'
        },
        tickets: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Jumlah tiket Gacha (Spin to Win)'
        }
    }, {
        timestamps: true,
    });

    return User;
};
