const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/superAdminController');
const jwt = require('jsonwebtoken');

// ── JWT Guard ────────────────────────────────────────────────────────────────
// Menerima token regular (JWT_SECRET) dengan role='admin'
// Tidak butuh user baru - admin toko yang sudah ada bisa langsung akses
const authSuperAdmin = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        console.log('[SA Auth] Missing or invalid header:', auth);
        return res.status(401).json({ message: 'Token diperlukan.' });
    }
    try {
        const token = auth.split(' ')[1];

        // Hanya verifikasi menggunakan SUPERADMIN_JWT_SECRET
        const payload = jwt.verify(token, process.env.SUPERADMIN_JWT_SECRET || 'superadmin-jwt-very-secret-2026');

        if (payload.role !== 'admin' || !payload.isSuperAdmin) {
            console.log('[SA Auth] Forbidden: Role is', payload.role, 'isSuperAdmin:', payload.isSuperAdmin);
            return res.status(403).json({ message: 'Akses ditolak. Token bukan milik Super Admin.' });
        }

        req.superAdmin = payload;
        next();
    } catch (err) {
        console.error('[SA Auth] JWT Verify Error:', err.message);
        return res.status(401).json({ message: 'Token kadaluarsa atau tidak valid.' });
    }
};

// ── Protected (Hanya Admin) ───────────────────────────────────────────────────
router.get('/dashboard', authSuperAdmin, ctrl.getDashboardStats);
router.get('/tenants', authSuperAdmin, ctrl.listTenants);
router.get('/tenants/:id', authSuperAdmin, ctrl.getTenant);
router.post('/tenants', authSuperAdmin, ctrl.createTenant);
router.put('/tenants/:id/status', authSuperAdmin, ctrl.updateTenantStatus);
router.put('/tenants/:id/config', authSuperAdmin, ctrl.updateTenantConfig);
router.post('/tenants/:id/impersonate', authSuperAdmin, ctrl.impersonate);
router.post('/tenants/:id/balance', authSuperAdmin, ctrl.updateTenantBalance);
router.put('/tenants/:id/plan', authSuperAdmin, ctrl.updateTenantPlan);
router.delete('/tenants/:id', authSuperAdmin, ctrl.deleteTenant);

// ── SaaS Configuration & Tools ────────────────────────────────────────────────
const settingsCtrl = require('../controllers/superAdminSettingsController');

// Platform Settings (Markup, Payment, API Keys)
router.get('/settings', authSuperAdmin, settingsCtrl.getSettings);
router.put('/settings/:key', authSuperAdmin, settingsCtrl.updateSetting);

// SaaS Plans / Subscriptions
router.get('/plans', authSuperAdmin, settingsCtrl.getPlans);
router.post('/plans', authSuperAdmin, settingsCtrl.createPlan);
router.put('/plans/:id', authSuperAdmin, settingsCtrl.updatePlan);

// Domain Requests
router.get('/domains', authSuperAdmin, settingsCtrl.getDomainRequests);
router.put('/domains/:id', authSuperAdmin, settingsCtrl.updateDomainRequest);

// Broadcast Messages
router.get('/broadcasts', authSuperAdmin, settingsCtrl.getBroadcasts);
router.post('/broadcasts', authSuperAdmin, settingsCtrl.createBroadcast);

// Provider Webhook Logs
router.get('/provider-logs', authSuperAdmin, settingsCtrl.getProviderLogs);

module.exports = router;
