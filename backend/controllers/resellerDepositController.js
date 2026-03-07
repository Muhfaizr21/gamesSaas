const TenantDepositRequest = require('../master_models/TenantDepositRequest');
const Tenant = require('../master_models/Tenant');
const TenantBalanceLog = require('../master_models/TenantBalanceLog');

module.exports = {

    // ==========================================
    // 1. FOR RESELLER (TENANT ADMIN)
    // ==========================================

    // Mengambil riwayat pengajuan deposit untuk tenant yang sedang login
    getTenantDeposits: async (req, res) => {
        try {
            const tenantId = req.tenant.id;
            const deposits = await TenantDepositRequest.findAll({
                where: { tenantId },
                order: [['createdAt', 'DESC']]
            });
            res.json(deposits);
        } catch (error) {
            console.error('[Tenant Deposit Error]', error);
            res.status(500).json({ message: 'Gagal mengambil riwayat deposit', error: error.message });
        }
    },

    // Mengajukan deposit baru
    requestDeposit: async (req, res) => {
        try {
            const tenantId = req.tenant.id;
            const { amount, paymentMethod, note } = req.body;

            if (!amount || amount < 10000) {
                return res.status(400).json({ message: 'Minimal deposit adalah Rp 10.000' });
            }

            const newRequest = await TenantDepositRequest.create({
                tenantId,
                amount,
                paymentMethod: paymentMethod || 'Manual Transfer',
                note: note || '',
                status: 'pending'
            });

            res.status(201).json({
                message: 'Pengajuan deposit berhasil dibuat. Silakan transfer dan hubungi Super Admin.',
                request: newRequest
            });
        } catch (error) {
            console.error('[Deposit Request Error]', error);
            res.status(500).json({ message: 'Gagal membuat pengajuan deposit', error: error.message });
        }
    },

    // ==========================================
    // 2. FOR SUPER ADMIN
    // ==========================================

    // Mengambil semua pengajuan deposit dari semua tenant
    getAllDepositRequests: async (req, res) => {
        try {
            const deposits = await TenantDepositRequest.findAll({
                include: [{
                    model: Tenant,
                    as: 'tenant',
                    attributes: ['id', 'name', 'subdomain', 'balance']
                }],
                order: [
                    // Urutkan yang pending di atas
                    ['status', 'DESC'],
                    ['createdAt', 'DESC']
                ]
            });
            res.json(deposits);
        } catch (error) {
            console.error('[SuperAdmin Deposit Error]', error);
            res.status(500).json({ message: 'Gagal mengambil data deposit', error: error.message });
        }
    },

    // Setujui deposit -> Tambah saldo tenant
    approveDeposit: async (req, res) => {
        try {
            const { id } = req.params;
            const deposit = await TenantDepositRequest.findByPk(id, { include: ['tenant'] });

            if (!deposit) {
                return res.status(404).json({ message: 'Pengajuan deposit tidak ditemukan' });
            }

            if (deposit.status !== 'pending') {
                return res.status(400).json({ message: `Deposit ini sudah diproses (${deposit.status})` });
            }

            const tenant = deposit.tenant;
            if (!tenant) {
                return res.status(404).json({ message: 'Toko/Tenant tidak ditemukan' });
            }

            const amount = parseFloat(deposit.amount);
            const balanceBefore = parseFloat(tenant.balance || 0);
            const balanceAfter = balanceBefore + amount;

            // 1. Update stok saldo di Tabel Tenant
            tenant.balance = balanceAfter;
            await tenant.save();

            // 2. Tandai pengajuan sebagai disetujui
            deposit.status = 'approved';
            await deposit.save();

            // 3. Catat ke Tabel Balance Log
            await TenantBalanceLog.create({
                tenantId: tenant.id,
                type: 'deposit_approve',
                amount: amount,
                balanceBefore: balanceBefore,
                balanceAfter: balanceAfter,
                note: `Approved deposit request: ${deposit.id}`
            });

            res.json({ message: `Deposit Rp ${amount.toLocaleString('id-ID')} disetujui untuk ${tenant.name}. Filter Saldo: Rp ${balanceAfter.toLocaleString('id-ID')}` });
        } catch (error) {
            console.error('[Admin Approve Error]', error);
            res.status(500).json({ message: 'Gagal menyetujui deposit', error: error.message });
        }
    },

    // Tolak deposit
    rejectDeposit: async (req, res) => {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const deposit = await TenantDepositRequest.findByPk(id);

            if (!deposit) {
                return res.status(404).json({ message: 'Pengajuan deposit tidak ditemukan' });
            }

            if (deposit.status !== 'pending') {
                return res.status(400).json({ message: `Deposit ini sudah diproses (${deposit.status})` });
            }

            deposit.status = 'rejected';
            if (reason) {
                deposit.note = deposit.note ? `${deposit.note} | Alasan tolak: ${reason}` : `Alasan tolak: ${reason}`;
            }

            await deposit.save();
            res.json({ message: 'Deposit berhasil ditolak.' });
        } catch (error) {
            console.error('[Admin Reject Error]', error);
            res.status(500).json({ message: 'Gagal menolak deposit', error: error.message });
        }
    }
};
