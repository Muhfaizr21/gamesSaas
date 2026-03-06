const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const spinController = require('../controllers/spinController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);
router.get('/my-orders', protect, authController.getMyOrders);

// -- Reviews --
router.post('/reviews', protect, reviewController.createReview);

// -- Spin to Win --
router.get('/spin-wheel/prizes', protect, spinController.getWheelPrizes);
router.post('/spin-wheel', protect, spinController.spinWheel);

module.exports = router;


