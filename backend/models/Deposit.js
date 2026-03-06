module.exports = (sequelize, DataTypes) => {
    const Deposit = sequelize.define('Deposit', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Success', 'Failed'),
            defaultValue: 'Pending',
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        timestamps: true,
        indexes: [
            { fields: ['user_id'] },           // Deposits per user
            { fields: ['status'] },            // Filter pending deposits
            { fields: ['user_id', 'status'] }, // User's pending deposits
            { fields: ['created_at'] },        // Sort by date
        ]
    });

    Deposit.associate = (models) => {
        // Associations
        models.Deposit.belongsTo(models.User, { foreignKey: 'userId' });
        models.User.hasMany(models.Deposit, { foreignKey: 'userId' });
    };

    return Deposit;
};
