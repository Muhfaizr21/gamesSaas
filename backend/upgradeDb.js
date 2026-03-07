const mysql = require('mysql2/promise');
require('dotenv').config();

async function upgrade() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || process.env.DB_PASS || 'root',
            database: 'topup_master'
        });

        console.log('Connected to master DB');

        // Add Tripay columns with snake_case
        await conn.query('ALTER TABLE tenant_configs ADD COLUMN tripay_merchant_code VARCHAR(255) NULL;');
        await conn.query('ALTER TABLE tenant_configs ADD COLUMN tripay_api_key VARCHAR(255) NULL;');
        await conn.query('ALTER TABLE tenant_configs ADD COLUMN tripay_private_key VARCHAR(255) NULL;');

        // Drop previous wrongly named columns (optional)
        try {
            await conn.query('ALTER TABLE tenant_configs DROP COLUMN tripayMerchantCode;');
            await conn.query('ALTER TABLE tenant_configs DROP COLUMN tripayApiKey;');
            await conn.query('ALTER TABLE tenant_configs DROP COLUMN tripayPrivateKey;');
        } catch (e) { }

        // Drop Prismalink columns (optional, ignoring errors if they don't exist)
        try {
            await conn.query('ALTER TABLE tenant_configs DROP COLUMN prismalinkMerchantId;');
            await conn.query('ALTER TABLE tenant_configs DROP COLUMN prismalinkSecretKey;');
        } catch (e) { console.log('Prismalink cols not dropped: ', e.message); }

        console.log('Migration complete');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

upgrade();
