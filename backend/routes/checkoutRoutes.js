const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.get('/channels', checkoutController.getPaymentChannels);
router.post('/create', checkoutController.createOrder);
router.post('/callback', checkoutController.prismalinkCallback); // Webhook receiver from PrismaLink
router.post('/digiflazz-webhook', checkoutController.digiflazzWebhook); // Webhook from Digiflazz
router.get('/:invoiceNumber', checkoutController.getOrderByInvoice);

module.exports = router;
