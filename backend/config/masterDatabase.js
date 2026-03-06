const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const masterSequelize = new Sequelize(
    'topup_master', // Nama database master statik
    process.env.DB_USER || 'root',
    process.env.DB_PASS || 'root',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        define: {
            underscored: true,
            timestamps: true
        }
    }
);

module.exports = masterSequelize;
