const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const promoController = require('../controllers/promoController');
const reviewController = require('../controllers/reviewController');

// --- Categories ---
router.get('/categories', async (req, res) => {
        const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
});

// --- Vouchers (Brands) ---
router.get('/vouchers', async (req, res) => {
        const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
        const vouchers = await Voucher.findAll({
            where: { isActive: true },
            attributes: ['id', 'name', 'slug', 'thumbnail', 'isActive'],
            include: [{ model: Category, attributes: ['id', 'name', 'slug'] }],
            order: [['name', 'ASC']]
        });
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vouchers', error });
    }
});

router.get('/vouchers/:slug', async (req, res) => {
        const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
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

        // Fetch Active Promo for this voucher (or global) using robust filtering
        const promoLogFile = 'c:/laragon/www/topup/backend/tmp_debug_promo.log';
        const logToDebugFile = (msg) => {
            const fs = require('fs');
            fs.appendFileSync(promoLogFile, `[${new Date().toISOString()}] ${msg}\n`);
        };

        const now = new Date();
        const promos = await Promo.findAll({ where: { is_active: true } });
        logToDebugFile(`Request Slug: ${req.params.slug}`);
        logToDebugFile(`Current Time: ${now.toISOString()}`);
        logToDebugFile(`Total Promos: ${promos.length}`);

        const activePromo = promos.find(p => {
            const startDate = new Date(p.start_date);
            const endDate = new Date(p.end_date);
            const isTimeValid = now >= startDate && now <= endDate;
            const isTargetMatch = !p.target_slug || p.target_slug === '' || p.target_slug === req.params.slug;

            logToDebugFile(`Checking Promo: ${p.id} - ${p.name}`);
            logToDebugFile(`  - Time Valid: ${isTimeValid} (Start: ${startDate.toISOString()}, End: ${endDate.toISOString()})`);
            logToDebugFile(`  - Target Match: ${isTargetMatch} (Target: "${p.target_slug}")`);

            return isTimeValid && isTargetMatch;
        });

        logToDebugFile(`Final Active Promo: ${activePromo ? activePromo.name : 'NONE'}`);

        res.json({
            ...voucher.toJSON(),
            activePromo: activePromo || null
        });
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
