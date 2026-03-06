module.exports = (sequelize, DataTypes) => {
    const Setting = sequelize.define('Setting', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'settings',
        timestamps: true
    });

    return Setting;
};
