module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
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
        }
    }, {
        timestamps: true,
        indexes: [
            { unique: true, fields: ['name'], name: 'categories_name_unique' },
            { unique: true, fields: ['slug'], name: 'categories_slug_unique' },
        ]
    });

    return Category;
};
