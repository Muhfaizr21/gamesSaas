const Tenant = require('../master_models/Tenant');
const TenantConfig = require('../master_models/TenantConfig');
const TenantBalanceLog = require('../master_models/TenantBalanceLog');
const masterSequelize = require('../config/masterDatabase');
const { Sequelize, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {

    // ─── DASHBOARD STATS ──────────────────────────────────────────────────────
    getDashboardStats: async (req, res) => {
        try {
            const totalTenants = await Tenant.count();
            const activeTenants = await Tenant.count({ where: { status: 'active' } });
            const suspended = await Tenant.count({ where: { status: 'suspended' } });

            // Pertumbuhan klien per bulan (6 bulan terakhir)
            const six = new Date();
            six.setMonth(six.getMonth() - 5);
            const growth = await Tenant.findAll({
                attributes: [
                    [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m'), 'month'],
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
                ],
                where: { created_at: { [Op.gte]: six } },
                group: ['month'],
                order: [[Sequelize.literal('month'), 'ASC']],
                raw: true
            });

            res.json({ totalTenants, activeTenants, suspended, growth });
        } catch (err) {
            res.status(500).json({ message: 'Gagal ambil stats', error: err.message });
        }
    },

    // ─── LIST TENANTS ─────────────────────────────────────────────────────────
    listTenants: async (req, res) => {
        try {
            const tenants = await Tenant.findAll({
                include: [{ model: TenantConfig, attributes: ['digiflazzUsername', 'markupPercent'] }],
                order: [['created_at', 'DESC']]
            });
            res.json(tenants);
        } catch (err) {
            res.status(500).json({ message: 'Gagal ambil list toko', error: err.message });
        }
    },

    // ─── GET SINGLE TENANT ───────────────────────────────────────────────────
    getTenant: async (req, res) => {
        try {
            const tenant = await Tenant.findByPk(req.params.id, {
                include: [{ model: TenantConfig }]
            });
            if (!tenant) return res.status(404).json({ message: 'Toko tidak ditemukan.' });
            res.json(tenant);
        } catch (err) {
            res.status(500).json({ message: 'Error', error: err.message });
        }
    },

    // ─── CREATE TENANT ────────────────────────────────────────────────────────
    createTenant: async (req, res) => {
        const { name, subdomain, adminName, adminEmail, adminWhatsapp, adminPassword, digiflazzUsername, digiflazzKey } = req.body;
        if (!name || !subdomain || !adminPassword)
            return res.status(400).json({ message: 'Nama toko, subdomain, dan password wajib diisi.' });

        const dbName = `tenant_${subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        const transaction = await masterSequelize.transaction();
        try {
            const existing = await Tenant.findOne({ where: { subdomain } });
            if (existing) return res.status(400).json({ message: 'Subdomain sudah dipakai.' });

            const tenant = await Tenant.create({ name, subdomain: subdomain.toLowerCase(), dbName, status: 'active' }, { transaction });
            await TenantConfig.create({ tenantId: tenant.id, digiflazzUsername: digiflazzUsername || '', digiflazzKey: digiflazzKey || '', markupPercent: 10 }, { transaction });
            await masterSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

            const tenantSeq = new Sequelize(dbName, process.env.DB_USER || 'root', process.env.DB_PASS || 'root', {
                host: process.env.DB_HOST || '127.0.0.1', port: process.env.DB_PORT || 3306,
                dialect: 'mysql', logging: false, define: { underscored: true, timestamps: true }
            });
            const models = require('../models/initTenantModels')(tenantSeq);
            await tenantSeq.sync({ force: true });

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(adminPassword, salt);
            await models.User.create({ name: adminName || 'Admin Toko', email: adminEmail || `admin@${subdomain}.id`, whatsapp: adminWhatsapp || '08000000000', password: hashed, role: 'admin' });
            await tenantSeq.close();
            await transaction.commit();

            res.status(201).json({ message: `Toko '${name}' berhasil dibuat!`, tenant: { id: tenant.id, subdomain: tenant.subdomain, dbName } });
        } catch (err) {
            await transaction.rollback();
            res.status(500).json({ message: 'Gagal membuat toko.', error: err.message });
        }
    },

    // ─── UPDATE STATUS ────────────────────────────────────────────────────────
    updateTenantStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!['active', 'suspended', 'trial'].includes(status))
                return res.status(400).json({ message: 'Status tidak valid.' });
            const tenant = await Tenant.findByPk(id);
            if (!tenant) return res.status(404).json({ message: 'Toko tidak ditemukan.' });
            tenant.status = status;
            await tenant.save();
            res.json({ message: `Status toko '${tenant.name}' diubah ke '${status}'.`, tenant });
        } catch (err) {
            res.status(500).json({ message: 'Gagal update status.', error: err.message });
        }
    },

    // ─── UPDATE TENANT CONFIG ─────────────────────────────────────────────────
    updateTenantConfig: async (req, res) => {
        try {
            const { id } = req.params;
            const { digiflazzUsername, digiflazzKey, markupPercent, customDomain } = req.body;

            const tenant = await Tenant.findByPk(id, { include: [TenantConfig] });
            if (!tenant) return res.status(404).json({ message: 'Toko tidak ditemukan.' });

            if (customDomain !== undefined) { tenant.custom_domain = customDomain; await tenant.save(); }
            if (tenant.TenantConfig) {
                await tenant.TenantConfig.update({ digiflazzUsername, digiflazzKey, markupPercent });
            }

            res.json({ message: 'Konfigurasi toko berhasil diperbarui.' });
        } catch (err) {
            res.status(500).json({ message: 'Gagal update config.', error: err.message });
        }
    },

    // ─── IMPERSONATE ──────────────────────────────────────────────────────────
    impersonate: async (req, res) => {
        try {
            const { id } = req.params;
            const tenant = await Tenant.findByPk(id);
            if (!tenant) return res.status(404).json({ message: 'Toko tidak ditemukan.' });

            // Buat token JWT sementara (1 jam) yang berlaku sebagai "admin" toko tersebut
            // Frontend akan menerima token ini dan memakai x-tenant header sesuai subdomain
            const impersonateToken = jwt.sign(
                { tenantId: tenant.id, subdomain: tenant.subdomain, impersonated: true, role: 'admin' },
                process.env.JWT_SECRET || 'supersecretkey-samstore',
                { expiresIn: '1h' }
            );

            res.json({
                token: impersonateToken,
                subdomain: tenant.subdomain,
                adminUrl: `/admin?tenant=${tenant.subdomain}`
            });
        } catch (err) {
            res.status(500).json({ message: 'Impersonate gagal.', error: err.message });
        }
    },

    // ─── UPDATE TENANT BALANCE (DEPOSIT/WITHDRAW) ─────────────────────────────
    updateTenantBalance: async (req, res) => {
        try {
            const { id } = req.params;
            const { amount, type, note } = req.body;

            if (!amount || amount <= 0) return res.status(400).json({ message: 'Nominal harus lebih dari 0' });
            if (!['kredit', 'debit'].includes(type)) return res.status(400).json({ message: 'Tipe transaksi tidak valid' });

            const tenant = await Tenant.findByPk(id);
            if (!tenant) return res.status(404).json({ message: 'Toko tidak ditemukan.' });

            const numAmount = parseFloat(amount);
            let currentBalance = parseFloat(tenant.balance || 0);
            const balanceBefore = currentBalance;
            let logType = 'manual_credit';

            if (type === 'kredit') {
                currentBalance += numAmount;
                logType = 'manual_credit';
            } else if (type === 'debit') {
                if (currentBalance < numAmount) return res.status(400).json({ message: 'Saldo tenant tidak mencukupi untuk dipotong' });
                currentBalance -= numAmount;
                logType = 'manual_debit';
            }

            tenant.balance = currentBalance;
            await tenant.save();

            // Catat ke tabel Log Mutasi/Deposit Reseller
            await TenantBalanceLog.create({
                tenantId: tenant.id,
                type: logType,
                amount: numAmount,
                balanceBefore: balanceBefore,
                balanceAfter: currentBalance,
                note: note || `Manual ${type} via Super Admin`
            });

            res.json({ message: `Berhasil ${type} saldo. Saldo akhir: Rp ${currentBalance}`, balance: currentBalance });
        } catch (err) {
            res.status(500).json({ message: 'Gagal update saldo tenant', error: err.message });
        }
    },
    // ─── UPDATE TENANT PLAN (SUBSCRIBE / RENEW) ────────────────────────────────
    updateTenantPlan: async (req, res) => {
        try {
            const { id } = req.params;
            const { planId } = req.body;

            const tenant = await Tenant.findByPk(id);
            if (!tenant) return res.status(404).json({ message: 'Toko tidak ditemukan.' });

            const SaaSPlan = require('../master_models/SaaSPlan');
            const plan = await SaaSPlan.findByPk(planId);
            if (!plan) return res.status(404).json({ message: 'Paket langganan tidak ditemukan.' });

            // Set new expiration date
            const durationDays = plan.durationDays || 30;
            const now = new Date();
            let newExpiry = new Date(tenant.subscriptionExpiresAt);

            // Jika belum punya langganan, atau langganan sudah expired, mulai dari hari ini
            if (!tenant.subscriptionExpiresAt || now > newExpiry) {
                newExpiry = new Date(now.getTime() + (durationDays * 24 * 60 * 60 * 1000));
            } else {
                // Jika masih aktif, tambahkan ke masa aktif sebelumnya
                newExpiry = new Date(newExpiry.getTime() + (durationDays * 24 * 60 * 60 * 1000));
            }

            tenant.planId = planId;
            tenant.subscriptionExpiresAt = newExpiry;
            // Jika sebelumnya tersuspend karena bayar, balikin ke active
            if (tenant.status === 'suspended') {
                tenant.status = 'active';
            }

            await tenant.save();

            res.json({
                message: `Berhasil mengatur paket '${plan.name}' untuk toko '${tenant.name}'.`,
                expiresAt: newExpiry
            });
        } catch (err) {
            res.status(500).json({ message: 'Gagal mengatur paket langganan', error: err.message });
        }
    },

    // ─── DELETE TENANT ────────────────────────────────────────────────────────
    deleteTenant: async (req, res) => {
        try {
            const { id } = req.params;
            const tenant = await Tenant.findByPk(id);
            if (!tenant) return res.status(404).json({ message: 'Toko tidak ditemukan.' });
            await TenantConfig.destroy({ where: { tenantId: id } });
            await tenant.destroy();
            // NOTE: Sengaja tidak DROP DATABASE untuk safety. 
            // Admin harus drop manual jika memang ingin hapus data permanen.
            res.json({ message: `Toko '${tenant.name}' dihapus dari master. Database '${tenant.dbName}' masih ada (manual drop jika perlu).` });
        } catch (err) {
            res.status(500).json({ message: 'Gagal hapus toko.', error: err.message });
        }
    }
};
