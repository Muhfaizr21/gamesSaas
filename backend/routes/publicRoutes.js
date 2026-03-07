const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const promoController = require('../controllers/promoController');
const reviewController = require('../controllers/reviewController');

// ── Public Route In-Memory Cache ─────────────────────────────────────────────
// Cache TTL: 2 menit untuk data yang jarang berubah (kategori, daftar voucher)
// Key format: `{tenantId}:{route}` — aman untuk multi-tenant
const publicCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 menit

function getCached(key) {
    const entry = publicCache.get(key);
    if (entry && (Date.now() - entry.ts) < CACHE_TTL_MS) return entry.data;
    publicCache.delete(key);
    return null;
}

function setCache(key, data) {
    publicCache.set(key, { data, ts: Date.now() });
}

// Export untuk dipakai admin controller saat update kategori/voucher (cache invalidation)
function invalidatePublicCache(tenantId) {
    for (const key of publicCache.keys()) {
        if (key.startsWith(tenantId + ':')) publicCache.delete(key);
    }
}
module.exports.invalidatePublicCache = invalidatePublicCache;
// ─────────────────────────────────────────────────────────────────────────────

// --- Categories ---
router.get('/categories', async (req, res) => {
    const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
        const tenantId = req.tenant?.id || 'default';
        const cacheKey = `${tenantId}:categories`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        setCache(cacheKey, categories);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
});

// --- Vouchers (Brands) ---
router.get('/vouchers', async (req, res) => {
    const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
        const tenantId = req.tenant?.id || 'default';
        const cacheKey = `${tenantId}:vouchers`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        const vouchers = await Voucher.findAll({
            where: { isActive: true },
            attributes: ['id', 'name', 'slug', 'thumbnail', 'isActive', 'requiresZoneId'],
            include: [{ model: Category, attributes: ['id', 'name', 'slug'] }],
            order: [['name', 'ASC']]
        });
        setCache(cacheKey, vouchers);
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vouchers', error });
    }
});

router.get('/vouchers/:slug', async (req, res) => {
    const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
        const tenantId = req.tenant?.id || 'default';
        const cacheKey = `${tenantId}:voucher:${req.params.slug}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        const voucher = await Voucher.findOne({
            where: { slug: req.params.slug, isActive: true },
            include: [{
                model: Product,
                where: { isActive: true },
                required: false,
                attributes: ['id', 'name', 'sku', 'price_sell', 'price_reseller', 'stock', 'image_url']
            }],
            order: [[Product, 'price_sell', 'ASC']]
        });
        if (!voucher) return res.status(404).json({ message: 'Voucher/Game not found' });

        // Fetch Active Promo for this voucher (or global)
        const now = new Date();
        const promos = await Promo.findAll({ where: { is_active: true } });

        const activePromo = promos.find(p => {
            const startDate = new Date(p.start_date);
            const endDate = new Date(p.end_date);
            const isTimeValid = now >= startDate && now <= endDate;
            const isTargetMatch = !p.target_slug || p.target_slug === '' || p.target_slug === req.params.slug;
            return isTimeValid && isTargetMatch;
        });

        const result = { ...voucher.toJSON(), activePromo: activePromo || null };
        // Cache 30 detik saja untuk voucher detail (karena ada promo yang bisa berubah tiap saat)
        publicCache.set(cacheKey, { data: result, ts: Date.now() - (CACHE_TTL_MS - 30000) });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching voucher details', error });
    }
});

// --- Products ---
router.get('/products', async (req, res) => {
    const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
        const products = await Product.findAll({
            where: { isActive: true },
            attributes: ['id', 'name', 'sku', 'price_sell', 'price_reseller', 'stock', 'voucherId'],
            include: [{ model: Voucher, attributes: ['id', 'name', 'slug', 'thumbnail'] }],
            order: [['price_sell', 'ASC']]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});


// --- Promos (Flash Sale) ---
router.get('/promos/active', promoController.getActivePromos);

// --- Reviews (Testimonial) ---
router.get('/reviews', reviewController.getPublicReviews);

// --- FOMO Notifications ---
const fomoController = require('../controllers/fomoController');
router.get('/fomo-notifications', fomoController.getFomoData);

// --- Promo Codes Validation ---
const promoCodeController = require('../controllers/promoCodeController');
router.post('/promo-codes/validate', promoCodeController.validateCoupon);

// --- Settings (Global) ---
router.get('/settings/theme', async (req, res) => {
    const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
        const themeOption = await Setting.findOne({ where: { key: 'event_theme' } });
        res.json({ theme: themeOption ? themeOption.value : 'default' });
    } catch (error) {
        res.status(500).json({ theme: 'default' });
    }
});

// --- Articles (Public) ---
const articleController = require('../controllers/articleController');
router.get('/articles', articleController.getPublishedArticles);
router.get('/articles/:slug', articleController.getArticleBySlug);

// --- Bank Accounts (Public — for user deposit page) ---
router.get('/bank-accounts', async (req, res) => {
    const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
        const accounts = await BankAccount.findAll({
            where: { is_active: true },
            order: [['sort_order', 'ASC'], ['bank_name', 'ASC']]
        });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bank accounts', error });
    }
});

// --- Sitemap Data ---
router.get('/sitemap-data', articleController.getSitemapData);

module.exports = router;
