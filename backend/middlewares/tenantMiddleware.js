const Tenant = require('../master_models/Tenant');
const TenantConfig = require('../master_models/TenantConfig');
const SaaSPlan = require('../master_models/SaaSPlan');
const { getTenantConnection } = require('../services/dbPoolManager');

// Memory Cache untuk menyimpan data Tenant (mengurangi query ke DB Master tiap request)
// Di-export agar module lain (checkout, updateOrderStatus) bisa invalidate setelah balance berubah
const tenantCache = new Map();

/**
 * Hapus cache untuk tenant tertentu agar next request ambil data fresh dari DB Master.
 * WAJIB dipanggil setelah saldo tenant berubah (deduct/topup).
 */
function invalidateTenantCache(subdomain) {
    if (subdomain && tenantCache.has(subdomain)) {
        tenantCache.delete(subdomain);
        console.log(`[Tenant Cache] Cache invalidated untuk: ${subdomain}`);
    }
}

const tenantMiddleware = async (req, res, next) => {
    try {
        // Ambil header x-tenant (misal dari frontend saat fetch data) atau parsing dari Req.Hostname
        // Di server produksi riil ganti menggunakan let host = req.hostname;
        let tenantSubdomain = req.headers['x-tenant'] || req.hostname.split('.')[0];

        // Untuk Local Development: Jika dari localhost, redirect ke toko 'budi' (topup_db asli)
        if (!tenantSubdomain || tenantSubdomain === 'localhost') {
            if (process.env.NODE_ENV !== 'production') {
                tenantSubdomain = process.env.DEFAULT_TENANT || 'budi';
            } else {
                return res.status(400).json({ message: 'Tenant identifier is missing. Gunakan x-tenant di header.' });
            }
        }

        let tenant = null;
        let cached = tenantCache.get(tenantSubdomain);

        // Cache valid selama 1 menit (60000ms) untuk optimisasi latency ekstrim
        if (cached && (Date.now() - cached.timestamp < 60000)) {
            tenant = cached.data;
        } else {
            // Cari data tenant di Database Master jika tidak ada di cache / expired
            tenant = await Tenant.findOne({
                where: { subdomain: tenantSubdomain },
                include: [
                    { model: TenantConfig },
                    { model: SaaSPlan, as: 'plan' }
                ]
            });

            if (tenant) {
                tenantCache.set(tenantSubdomain, {
                    data: tenant,
                    timestamp: Date.now()
                });
            }
        }

        if (!tenant) {
            return res.status(404).json({ message: `Toko dengan subdomain '${tenantSubdomain}' tidak ditemukan.` });
        }

        if (tenant.status !== 'active') {
            return res.status(403).json({ message: `Toko '${tenant.name}' sedang dinonaktifkan / disuspend.` });
        }

        // Memeriksa apakah langganan sudah kedaluwarsa
        if (tenant.subscriptionExpiresAt && new Date() > new Date(tenant.subscriptionExpiresAt)) {
            return res.status(403).json({
                message: `Masa aktif langganan toko '${tenant.name}' telah berakhir.`,
                code: 'SUBSCRIPTION_EXPIRED'
            });
        }

        // --- Proses Utama: Dynamic Database Allocation ---
        // Panggil Pool Manager untuk mendapatkan sambungan "Pribadi" milik tenant ini.
        const dbConn = await getTenantConnection(tenant);

        // Parse Plan Features to Array
        let allowedFeatures = [];
        if (tenant.plan && tenant.plan.features) {
            try {
                const parsed = JSON.parse(tenant.plan.features);
                if (Array.isArray(parsed)) {
                    // Filter out crossed features (those starting with "x " or "X ")
                    allowedFeatures = parsed.filter(f => !f.toLowerCase().startsWith('x '));
                }
            } catch (e) {
                console.error('[Tenant Middleware] Gagal parse JSON features', e);
            }
        }

        // Pasangkan (Attach) Objek-Objek Ini Ke Dalam Request
        // Supaya bisa diakses di Controllers (req.tenant, req.tenantConfig, req.db)
        req.tenant = tenant;
        req.tenantConfig = tenant.TenantConfig; // Berisi rahasia: digiflazzUsername & Key
        req.tenantFeatures = allowedFeatures; // Daftar string fitur yang nyala
        req.db = dbConn;

        next(); // Teruskan perjalanan request ke Endpoint selanjutnya (Routes)
    } catch (error) {
        console.error('[Tenant Middleware] Error Resolution Tenant:', error);
        res.status(500).json({ message: 'Internal Server Error pada pemetaan penyewa (Tenant)', raw: error.message });
    }
};

module.exports = tenantMiddleware;
module.exports.invalidateTenantCache = invalidateTenantCache;
