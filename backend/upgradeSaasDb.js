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

        // Rename balance to uniplayPoint (conceptually), but physically we can just add uniplay_cash and keep balance as is for points.
        // Actually, to be clean, let's keep `balance` as the Points, and add `uniplay_cash`.

        try {
            await conn.query('ALTER TABLE tenants ADD COLUMN uniplay_cash DECIMAL(15,2) NOT NULL DEFAULT 0;');
            console.log('Added uniplay_cash column to tenants table');
        } catch (e) {
            console.log('Column uniplay_cash might already exist:', e.message);
        }

        try {
            await conn.query("ALTER TABLE tenant_balance_logs ADD COLUMN balance_type ENUM('point', 'cash') NOT NULL DEFAULT 'point';");
            console.log('Added balance_type column to tenant_balance_logs table');
        } catch (e) {
            console.log('Column balance_type might already exist:', e.message);
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

upgrade();
