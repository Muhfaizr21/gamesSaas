const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middlewares/adminMiddleware');
const adminController = require('../controllers/adminController');
const promoController = require('../controllers/promoController');
const reviewController = require('../controllers/reviewController');

// All routes here are protected by adminMiddleware
router.use(adminMiddleware);

// -- Dashboard Stats --
router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);

// -- Categories --
router.post('/categories', adminController.createCategory);
router.get('/categories', adminController.getAllCategories);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// -- Vouchers (Games) --
router.post('/vouchers', adminController.createVoucher);
router.get('/vouchers', adminController.getAllVouchers);
router.put('/vouchers/:id', adminController.updateVoucher);
router.delete('/vouchers/:id', adminController.deleteVoucher);

// -- Upload Image untuk Voucher --
const upload = require('../middlewares/uploadMiddleware');
const uploadController = require('../controllers/uploadController');
router.post('/upload/voucher', upload.single('image'), uploadController.uploadVoucherThumbnail);

// --- Promo Codes (Manual) ---
const promoCodeController = require('../controllers/promoCodeController');
router.get('/promo-codes', promoCodeController.getAllCouponControls);
router.post('/promo-codes', promoCodeController.createCoupon);
router.put('/promo-codes/:id', promoCodeController.updateCoupon);
router.delete('/promo-codes/:id', promoCodeController.deleteCoupon);

// --- Spin to Win Prizes (Admin) ---
const spinController = require('../controllers/spinController');
router.get('/spin-prizes', spinController.getAllPrizes);
router.post('/spin-prizes', spinController.createPrize);
router.put('/spin-prizes/:id', spinController.updatePrize);
router.delete('/spin-prizes/:id', spinController.deletePrize);
router.get('/spin-settings', spinController.getGachaSettings);
router.post('/spin-settings', spinController.updateGachaSettings);

// -- Products (Items) --
router.post('/upload/product', upload.single('image'), uploadController.uploadProductImage);
router.post('/products/margin', adminController.updateProductMargin);
router.post('/products/sync', adminController.syncDigiflazzProducts);
router.get('/products/sync-status', adminController.getSyncStatus);
router.post('/products', adminController.createProduct);
router.get('/products', adminController.getAllProducts);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// -- Orders --
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// -- Promos (Flash Sale) --
router.get('/promos', promoController.getAllPromos);
router.post('/promos', promoController.createPromo);
router.put('/promos/:id', promoController.updatePromo);
router.delete('/promos/:id', promoController.deletePromo);
router.post('/upload/promo', upload.single('image'), uploadController.uploadPromoBanner);

// -- Reviews (Testimoni) --
router.get('/reviews', reviewController.getAllReviews);
router.put('/reviews/:id/toggle', reviewController.toggleVisibility);
router.delete('/reviews/:id', reviewController.deleteReview);

// -- Users --
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);


// -- Settings --
router.put('/settings/theme', async (req, res) => {
        const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
        const { theme } = req.body;
        if (!theme) return res.status(400).json({ message: 'Theme is required' });

        let themeSetting = await Setting.findOne({ where: { key: 'event_theme' } });

        if (themeSetting) {
            themeSetting.value = theme;
            await themeSetting.save();
        } else {
            themeSetting = await Setting.create({ key: 'event_theme', value: theme });
        }

        res.json({ message: 'Tema berhasil diperbarui', theme: themeSetting.value });
    } catch (error) {
        console.error("Error updating theme setting:", error);
        res.status(500).json({ message: 'Gagal memperbarui tema', error });
    }
});

router.get('/settings/whatsapp', async (req, res) => {
        const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
        const tokenSetting = await Setting.findOne({ where: { key: 'fonnte_token' } });
        res.json({ token: tokenSetting ? tokenSetting.value : '' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching WA setting', error });
    }
});

router.put('/settings/whatsapp', async (req, res) => {
        const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    try {
        const { token } = req.body;
        let tokenSetting = await Setting.findOne({ where: { key: 'fonnte_token' } });
        if (tokenSetting) {
            tokenSetting.value = token || '';
            await tokenSetting.save();
        } else {
            await Setting.create({ key: 'fonnte_token', value: token || '' });
        }
        res.json({ message: 'Token WA berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui token WA', error });
    }
});

// ─── Laporan Keuangan & Saving Pots ──────────────────────────────
const financeController = require('../controllers/financeController');
router.get('/finance/report', financeController.getReport);
router.get('/finance/pots', financeController.getSavingPots);
router.put('/finance/pots/allocation', financeController.updateAllocation);
router.post('/finance/pots/:id/withdraw', financeController.addWithdrawal);
router.get('/finance/pots/:id/history', financeController.getSavingHistory);
router.post('/finance/recalculate', financeController.recalculate);

module.exports = router;
