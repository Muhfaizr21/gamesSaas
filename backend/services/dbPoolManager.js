const { Sequelize } = require('sequelize');

// Variabel Cache di memori Node.js
// Untuk menyimpan koneksi yang sudah terbuka agar tidak membuat koneksi baru tiap request
const connectionPool = new Map();

/**
 * Fungsi untuk mengambil atau membuat koneksi database baru untuk tenant tertentu
 * @param {Object} tenant - Object tenant dari tabel `tenants` di topup_master
 * @returns {Sequelize} instance Sequelize yang terkoneksi ke database spesifik tenant
 */
async function getTenantConnection(tenant) {
    // 1. Cek apakah koneksi untuk tenant ini (nama db-nya) sudah ada di RAM (Cache)
    if (connectionPool.has(tenant.dbName)) {
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
        // Mengubah model Singleton lama sehingga terhubung ke `sequelize` instance yang BARU ini
        // (Akan kita buat file factory `initTenantModels` nanti)
        require('../models/initTenantModels')(sequelize);

        // 5. Simpan ke daftar cache
        connectionPool.set(tenant.dbName, sequelize);
        return sequelize;
    } catch (error) {
        console.error(`[DB Pool] Gagal terhubung ke database tenant: ${tenant.dbName}`, error);
        throw new Error(`Database ${tenant.dbName} tidak dapat diakses.`);
    }
}

module.exports = {
    getTenantConnection
};
