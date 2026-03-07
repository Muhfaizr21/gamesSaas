const { Sequelize } = require('sequelize');

// Variabel Cache di memori Node.js
// Untuk menyimpan koneksi yang sudah terbuka agar tidak membuat koneksi baru tiap request
const connectionPool = new Map();
const poolLastUsed = new Map();

// Check for idle DB connections every 15 minutes
setInterval(() => {
    const now = Date.now();
    for (const [dbName, seq] of connectionPool.entries()) {
        const lastUsed = poolLastUsed.get(dbName) || now;
        // If not used for 30 minutes (1800000 ms), close and delete from memory
        if (now - lastUsed > 1800000) {
            console.log(`[DB Pool Cleanup] Menutup dan menghapus koneksi tenant idle: ${dbName}`);
            seq.close().catch(e => console.error(e));
            connectionPool.delete(dbName);
            poolLastUsed.delete(dbName);
        }
    }
}, 15 * 60 * 1000);

/**
 * Fungsi untuk mengambil atau membuat koneksi database baru untuk tenant tertentu
 * @param {Object} tenant - Object tenant dari tabel `tenants` di topup_master
 * @returns {Sequelize} instance Sequelize yang terkoneksi ke database spesifik tenant
 */
async function getTenantConnection(tenant) {
    // 1. Cek apakah koneksi untuk tenant ini (nama db-nya) sudah ada di RAM (Cache)
    if (connectionPool.has(tenant.dbName)) {
        poolLastUsed.set(tenant.dbName, Date.now()); // Update lastUsed time
        return connectionPool.get(tenant.dbName);
    }

    // 2. Jika belum ada, buat koneksi baru ke database milik si toko (misal: tenant_12345)
    console.log(`[DB Pool] Membuka koneksi baru ke database: ${tenant.dbName}`);

    // Konfigurasi ini nantinya bisa membaca dbHost, dbUser, dan dbPass asli dari tenant DB jika berbeda server
    // Saat ini disimulasikan memakai akun root dengan port 8889 (karena pakai MAMP lokal)
    const sequelize = new Sequelize(
        tenant.dbName,
        tenant.dbUser || process.env.DB_USER || 'root',
        tenant.dbPass || process.env.DB_PASS || 'root',
        {
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false, // Hindari log yang terlalu kotor, ubah ke console.log untuk debug
            define: {
                underscored: true,
                timestamps: true
            },
            pool: {
                max: 5,        // Maksimal 5 koneksi simultan per-toko
                min: 0,
                acquire: 30000,
                idle: 10000    // Putus koneksi jika nganggur (idle) selama 10 detik
            }
        }
    );

    // 3. Tes apakah database-nya benar-benar ada / bisa diakses
    try {
        await sequelize.authenticate();

        // 4. Tahap Krusial: Inisialisasi Model secara Dinamis 
        // Hanya panggil initTenantModels jika sequelize.models kosong
        if (Object.keys(sequelize.models).length === 0) {
            require('../models/initTenantModels')(sequelize);
        }

        // 5. Simpan ke daftar cache
        connectionPool.set(tenant.dbName, sequelize);
        poolLastUsed.set(tenant.dbName, Date.now());
        return sequelize;
    } catch (error) {
        console.error(`[DB Pool] Gagal terhubung ke database tenant: ${tenant.dbName}`, error);
        throw new Error(`Database ${tenant.dbName} tidak dapat diakses.`);
    }
}

module.exports = {
    getTenantConnection
};
