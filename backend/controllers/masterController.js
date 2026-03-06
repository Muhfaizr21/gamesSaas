const Tenant = require('../master_models/Tenant');
const TenantConfig = require('../master_models/TenantConfig');
const masterSequelize = require('../config/masterDatabase');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const masterController = {
    // [CREATE] Mendaftarkan Toko Baru (Provisioning)
    createTenant: async (req, res) => {
        const { name, subdomain, adminName, adminEmail, adminWhatsapp, adminPassword, digiflazzUsername, digiflazzKey } = req.body;

        if (!name || !subdomain || !adminPassword) {
            return res.status(400).json({ message: 'Name, subdomain, dan Admin Password wajib diisi.' });
        }

        const dbName = `tenant_${subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

        const transaction = await masterSequelize.transaction();

        try {
            // 1. Cek Subdomain apakah sudah dipakai
            const existingTenant = await Tenant.findOne({ where: { subdomain } });
            if (existingTenant) {
                return res.status(400).json({ message: 'Subdomain sudah digunakan. Pilih yang lain.' });
            }

            // 2. Buat Record Tenant di Master DB
            const tenant = await Tenant.create({
                name,
                subdomain: subdomain.toLowerCase(),
                dbName,
                status: 'active'
            }, { transaction });

            // 3. Buat Record Config di Master DB
            await TenantConfig.create({
                tenantId: tenant.id,
                digiflazzUsername: digiflazzUsername || '',
                digiflazzKey: digiflazzKey || '',
                markupPercent: 10 // Default 10%
            }, { transaction });

            // 4. Buat Database Fisik di MySQL
            // Menggunakan root connection (masterSequelize) untuk menjalankan query CREATE DATABASE
            await masterSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

            // 5. Build/Sync Struktur Tabel ke Database Baru
            const tenantSequelize = new Sequelize(
                dbName,
                process.env.DB_USER || 'root',
                process.env.DB_PASS || 'root',
                {
                    host: process.env.DB_HOST || '127.0.0.1',
                    port: process.env.DB_PORT || 3306,
                    dialect: 'mysql',
                    logging: false,
                    define: { underscored: true, timestamps: true }
                }
            );

            // Inisialisasi Model di koneksi database toko yang baru dibuat
            const models = require('../models/initTenantModels')(tenantSequelize);

            // Sync semua tabel (membuat tabel Users, Orders, dsb di database baru)
            await tenantSequelize.sync({ force: true });

            // 6. Seeding Data Awal (Buat Akun Admin Pemilik Toko)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await models.User.create({
                name: adminName || 'Admin Toko',
                email: adminEmail || `admin@${subdomain}.samstore.id`,
                whatsapp: adminWhatsapp || `0800${Math.floor(Math.random() * 100000)}`,
                password: hashedPassword,
                role: 'admin'
            });

            // Putus koneksi setup
            await tenantSequelize.close();

            await transaction.commit();

            res.status(201).json({
                message: `Toko '${name}' berhasil dibangun!`,
                tenant: { id: tenant.id, subdomain: tenant.subdomain, dbName }
            });

        } catch (error) {
            await transaction.rollback();
            console.error('[Provisioning Error]', error);
            res.status(500).json({ message: 'Gagal membuat toko baru.', raw: error.message });
        }
    },

    // [UPDATE] Ubah Status Toko (Suspend / Activate)
    updateTenantStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'suspended', 'trial'].includes(status)) {
                return res.status(400).json({ message: 'Status tidak valid.' });
            }

            const tenant = await Tenant.findByPk(id);
            if (!tenant) return res.status(404).json({ message: 'Toko tidak ditemukan.' });

            tenant.status = status;
            await tenant.save();

            res.json({ message: `Status toko ${tenant.name} berhasil diubah menjadi ${status}.`, tenant });
        } catch (error) {
            res.status(500).json({ message: 'Gagal mengubah status toko.', error: error.message });
        }
    },

    // [READ] Statistik Global Platform SaaS
    getPlatformStats: async (req, res) => {
        try {
            const totalTenants = await Tenant.count();
            const activeTenants = await Tenant.count({ where: { status: 'active' } });

            // Note: Untuk menghitung total omset seluruh toko, 
            // butuh query looping ke semua db, atau ETL process tersendiri.
            // Saat ini kita kembalikan stat tenant dulu.
            res.json({
                totalTenants,
                activeTenants,
                suspendedTenants: totalTenants - activeTenants
            });
        } catch (error) {
            res.status(500).json({ message: 'Gagal mengambil statistik platform.', error: error.message });
        }
    }
};

module.exports = masterController;
