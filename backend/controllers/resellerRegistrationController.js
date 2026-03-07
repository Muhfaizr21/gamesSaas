const Tenant = require('../master_models/Tenant');
const TenantConfig = require('../master_models/TenantConfig');
const SaaSPlan = require('../master_models/SaaSPlan');
const masterSequelize = require('../config/masterDatabase');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const resellerRegistrationController = {
    // [POST] /api/master/register
    // Public Endpoint to register a new tenant (Reseller Auto-Provisioning)
    registerTenant: async (req, res) => {
        const { storeName, subdomain, ownerName, email, whatsapp, password, planId } = req.body;

        if (!storeName || !subdomain || !password || !email || !planId) {
            return res.status(400).json({ message: 'Lengkapi semua field yang wajib diisi.' });
        }

        const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (cleanSubdomain.length < 3) {
            return res.status(400).json({ message: 'Subdomain minimal 3 karakter.' });
        }

        const dbName = `tenant_${cleanSubdomain}`;
        const transaction = await masterSequelize.transaction();

        try {
            // 1. Cek ketersediaan Subdomain
            const existingTenant = await Tenant.findOne({ where: { subdomain: cleanSubdomain } });
            if (existingTenant) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Subdomain sudah digunakan. Silakan pilih subdomain lain.' });
            }

            // 2. Cek apakah Plan Valid
            const selectedPlan = await SaaSPlan.findByPk(planId);
            if (!selectedPlan) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Paket yang dipilih tidak ditemukan.' });
            }

            // Hitung expiration date berdasarkan durationDays dari plan
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + selectedPlan.durationDays);

            // 3. Buat Record Tenant
            const newTenant = await Tenant.create({
                name: storeName,
                subdomain: cleanSubdomain,
                dbName: dbName,
                adminName: ownerName,
                adminEmail: email,
                adminWhatsapp: whatsapp,
                status: 'trial', // Start as trial. User can pay deposit directly. Or active right away. Let's set 'active' for MVP if using balance later
                planId: selectedPlan.id,
                subscriptionExpiresAt: expirationDate,
                balance: 0
            }, { transaction });

            // 4. Buat Record Config Default
            await TenantConfig.create({
                tenantId: newTenant.id,
                digiflazzUsername: '', // Kosong agar pakai milik master saat webhook, tapi dikelola sistem lain
                digiflazzKey: '',
                markupPercent: 10
            }, { transaction });

            // 5. Buat Database Fisik MySQL
            await masterSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

            // 6. Init Database Baru (Sync Struktur Tabel)
            const tenantEnvHost = process.env.DB_HOST === 'host.docker.internal' ? 'host.docker.internal' : (process.env.DB_HOST || '127.0.0.1');

            const tenantSequelize = new Sequelize(
                dbName,
                process.env.DB_USER || 'root',
                process.env.DB_PASS || 'root',
                {
                    host: tenantEnvHost,
                    port: process.env.DB_PORT || 3306,
                    dialect: 'mysql',
                    logging: false,
                    define: { underscored: true, timestamps: true }
                }
            );

            // Inisialisasi Model di DB toko si reseller
            const models = require('../models/initTenantModels')(tenantSequelize);
            await tenantSequelize.sync({ force: true });

            // 7. Seed Akun Owner / Admin di DB Toko tersebut
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await models.User.create({
                name: ownerName,
                email: email,
                whatsapp: whatsapp || '',
                password: hashedPassword,
                role: 'admin' // Dia master admin di tokonya sendiri!
            });

            await tenantSequelize.close();
            await transaction.commit();

            res.status(201).json({
                message: `Toko '${storeName}' berhasil dibuat!`,
                storeUrl: `http://${cleanSubdomain}.localhost:3000`, // Sesuaikan local
                tenant: {
                    id: newTenant.id,
                    subdomain: newTenant.subdomain
                }
            });

        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('[Reseller Registration Error]', error);
            res.status(500).json({ message: 'Terjadi kesalahan sistem saat membuat toko.', error: error.message });
        }
    }
};

module.exports = resellerRegistrationController;
