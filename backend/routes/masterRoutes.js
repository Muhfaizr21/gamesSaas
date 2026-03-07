const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');

// Proteksi SuperAdmin (Idealnya JWT Token, tapi untuk bypass sementara bisa tanpa ini / Basic Auth)
// Middleware auth khusus master belum dibuat, jadi kita buka sementara untuk testing:
const verifySuperAdmin = (req, res, next) => {
    // Di produksi, cek req.headers.authorization dan pastikan dia pemilik SaaS.
    const secret = req.headers['x-superadmin-secret'];
    if (secret !== process.env.SUPERADMIN_SECRET && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Akses Ditolak. Khusus Superadmin SaaS.' });
    }
    next();
};

// Route: Buat Toko / Tenant Baru
router.post('/tenants', verifySuperAdmin, masterController.createTenant);

// Route: Menangguhkan / Mengaktifkan Toko
router.put('/tenants/:id/status', verifySuperAdmin, masterController.updateTenantStatus);

// Route: Get Statistik Global
router.get('/stats', verifySuperAdmin, masterController.getPlatformStats);

// Route: Public - Pendaftaran Reseller / Buat Toko Baru (Auto Provisioning)
const resellerRegistrationController = require('../controllers/resellerRegistrationController');
const rateLimit = require('express-rate-limit');
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 3, // Batasi 1 IP maksimal daftar 3 toko tiap 15 menit
    message: { message: 'Terlalu banyak request. Silakan coba lagi setelah 15 menit.' }
});

router.post('/register', registerLimiter, resellerRegistrationController.registerTenant);

// Route: Public - tampilkan paket SaaS di landing page reseller (tanpa auth)
const SaaSPlan = require('../master_models/SaaSPlan');
router.get('/plans/public', async (req, res) => {
    try {
        const plans = await SaaSPlan.findAll({ where: { isActive: true }, order: [['price', 'ASC']] });
        const parsed = plans.map(p => {
            const pd = p.toJSON();
            try { pd.features = JSON.parse(pd.features); } catch (e) { pd.features = []; }
            return pd;
        });
        res.json(parsed);
    } catch (err) {
        res.status(500).json({ message: 'Gagal ambil plan', error: err.message });
    }
});

module.exports = router;
