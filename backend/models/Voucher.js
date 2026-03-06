module.exports = (sequelize, DataTypes) => {
    const Voucher = sequelize.define('Voucher', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        thumbnail: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        guide: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    }, {
        timestamps: true,
        indexes: [
            { fields: ['is_active'] },         // Public listing filter
            { fields: ['category_id'] },        // Vouchers by category
            { fields: ['is_active', 'category_id'] }, // Active vouchers per category
        ]
    });

    Voucher.associate = (models) => {
        // Associations
        models.Voucher.belongsTo(models.Category, { foreignKey: 'categoryId' });
        models.Category.hasMany(models.Voucher, { foreignKey: 'categoryId' });
    };

    return Voucher;
};
