const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect } = require('../middlewares/authMiddleware');

// Writer-only middleware
const writerOnly = (req, res, next) => {
        const { User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction } = req.db.models;
    if (req.user.role !== 'writer' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak. Hanya Writer/Admin yang boleh mengakses.' });
    }
    next();
};

// Writer endpoints (protected)
router.get('/my-articles', protect, writerOnly, articleController.getMyArticles);
router.post('/', protect, writerOnly, articleController.createArticle);
router.put('/:id', protect, writerOnly, articleController.updateArticle);
router.delete('/:id', protect, writerOnly, articleController.deleteArticle);

const upload = require('../middlewares/uploadMiddleware');
const uploadController = require('../controllers/uploadController');
router.post('/upload/article', protect, writerOnly, upload.single('image'), uploadController.uploadArticleThumbnail);

module.exports = router;
