const { PromoCode, Product } = require('../models');

// Admin side
exports.getAllCouponControls = async (req, res) => {
    try {
        const coupons = await PromoCode.findAll({ order: [['createdAt', 'DESC']] });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.id === '') delete data.id;
        const coupon = await PromoCode.create(data);
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await PromoCode.findByPk(req.params.id);
        if (!coupon) return res.status(404).json({ message: 'Kode promo tidak ditemukan' });
        await coupon.update(req.body);
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await PromoCode.findByPk(req.params.id);
        if (!coupon) return res.status(404).json({ message: 'Kode promo tidak ditemukan' });
        await coupon.destroy();
        res.json({ message: 'Kode promo dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// API Public untuk validasi saat user mengetik kupon di form Checkout
// POST /api/public/promo-codes/validate
exports.validateCoupon = async (req, res) => {
    try {
        const { code, product_price } = req.body;
        if (!code) return res.status(400).json({ valid: false, message: 'Kode kosong' });

        const coupon = await PromoCode.findOne({ where: { code: code } });

        if (!coupon) return res.status(404).json({ valid: false, message: 'Kode promo tidak valid' });
        if (!coupon.is_active) return res.status(400).json({ valid: false, message: 'Kode promo sudah tidak aktif' });
        if (coupon.quota > 0 && coupon.used >= coupon.quota) return res.status(400).json({ valid: false, message: 'Kuota promo ini telah habis' });
        if (product_price && parseFloat(product_price) < parseFloat(coupon.min_purchase)) {
            return res.status(400).json({ valid: false, message: `Minimal belanja Rp ${coupon.min_purchase.toLocaleString('id-ID')} untuk pakai kode ini` });
        }

        // Kalkulasi diskon
        let nominal_discount = 0;
        if (coupon.discount_type === 'percentage') {
            nominal_discount = (product_price * parseFloat(coupon.discount_value)) / 100;
            if (coupon.max_discount && nominal_discount > parseFloat(coupon.max_discount)) {
                nominal_discount = parseFloat(coupon.max_discount);
            }
        } else {
            nominal_discount = parseFloat(coupon.discount_value);
        }

        res.json({
            valid: true,
            message: 'Kode promo berhasil dipakai!',
            coupon_id: coupon.id,
            discount_amount: nominal_discount
        });

    } catch (error) {
        res.status(500).json({ valid: false, message: error.message });
    }
};
