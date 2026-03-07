// Removed global models require
const { Op } = require('sequelize');
const whatsappService = require('../services/whatsappService');
// Demo payment channels - ditampilkan jika PrismaLink belum dikonfigurasi / sandbox mode
const DEMO_CHANNELS = [
    { group: 'Virtual Account', code: '014', name: 'BCA Virtual Account', icon_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg', active: true },
    { group: 'Virtual Account', code: '002', name: 'BRI Virtual Account', icon_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/BRI_2020.svg', active: true },
    { group: 'Virtual Account', code: '008', name: 'Mandiri Virtual Account', icon_url: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg', active: true },
    { group: 'E-Wallet', code: 'QRIS', name: 'QRIS (Semua E-Wallet)', icon_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg', active: true },
    { group: 'E-Wallet', code: 'OVO', name: 'OVO', icon_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/OVO_logo.svg', active: true },
    { group: 'E-Wallet', code: 'DANA', name: 'DANA', icon_url: 'https://upload.wikimedia.org/wikipedia/commons/d/df/DANA_logo.svg', active: true },
    { group: 'Convenience Store', code: 'ALFAMART', name: 'Alfamart', icon_url: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Alfamart_logo.svg', active: true }
];

const isDemoMode = (req) => {
    const key = req?.tenantConfig?.prismalinkSecretKey || process.env.PRISMALINK_SECRET_KEY;
    return !key || key === 'your_prismalink_secret_key' || key.length < 10;
};

exports.getPaymentChannels = async (req, res, next) => {
    try {
        if (isDemoMode(req)) {
            return res.json(DEMO_CHANNELS);
        }
        const PrismalinkService = require('../services/prismalinkService');
        const prismalinkService = new PrismalinkService(req.tenantConfig?.prismalinkMerchantId, req.tenantConfig?.prismalinkSecretKey);
        const channels = await prismalinkService.getPaymentChannels();
        res.json(channels.data || DEMO_CHANNELS);
    } catch (error) {
        next(error);
    }
};

exports.createOrder = async (req, res, next) => {
    try {
        const { Order, Product, Voucher, User, Promo, PromoCode } = req.db.models;
        const { productId, customerId, zoneId, paymentMethod, customerName, whatsappNumber, usePoints, promoCode } = req.body;
        const userId = req.user?.id || null;

        const product = await Product.findByPk(productId, { include: Voucher });
        if (!product || !product.isActive) {
            return res.status(404).json({ message: 'Produk tidak ditemukan atau tidak aktif' });
        }

        const fee = 1000;
        let price = Number(product.price_sell);
        let promoDiscount = 0;
        let couponDiscount = 0;

        const now = new Date();
        const activePromo = await Promo.findOne({
            where: {
                is_active: true,
                start_date: { [Op.lte]: now },
                end_date: { [Op.gte]: now },
                [Op.or]: [
                    { target_slug: null },
                    { target_slug: '' },
                    { target_slug: product.Voucher?.slug }
                ]
            }
        });

        if (activePromo) {
            promoDiscount = (price * Number(activePromo.discount_percentage)) / 100;
        }

        // --- Promo Code Logic ---
        if (promoCode) {
            const coupon = await PromoCode.findOne({ where: { code: promoCode, is_active: true } });
            if (coupon && (coupon.quota <= 0 || coupon.used < coupon.quota)) {
                if (price >= Number(coupon.min_purchase)) {
                    if (coupon.discount_type === 'percentage') {
                        couponDiscount = (price * Number(coupon.discount_value)) / 100;
                        if (coupon.max_discount && couponDiscount > Number(coupon.max_discount)) {
                            couponDiscount = Number(coupon.max_discount);
                        }
                    } else {
                        couponDiscount = Number(coupon.discount_value);
                    }
                    await coupon.increment('used', { by: 1 });
                }
            }
        }
        // -----------------------

        let pointsUsed = 0;
        let pointsDiscount = 0;

        if (userId && usePoints) {
            const user = await User.findByPk(userId);
            if (user && user.points > 0) {
                const subtotal = price - promoDiscount - couponDiscount + fee;
                if (user.points >= subtotal) {
                    pointsDiscount = subtotal - 10000; // Keep 10k for payment gateway
                    if (pointsDiscount < 0) pointsDiscount = 0;
                } else {
                    pointsDiscount = user.points;
                }

                const testTotal = subtotal - pointsDiscount;
                if (testTotal > 0 && testTotal < 10000 && !isDemoMode(req)) {
                    pointsDiscount = subtotal - 10000; // clamp so they pay 10k min
                    if (pointsDiscount < 0) pointsDiscount = 0;
                }
                pointsUsed = pointsDiscount;
            }
        }

        const totalAmount = price - promoDiscount - couponDiscount - pointsDiscount + fee;

        if (pointsUsed > 0 && userId) {
            await User.decrement('points', { by: pointsUsed, where: { id: userId } });
        }

        const invoiceNumber = 'INV-' + Date.now() + Math.floor(Math.random() * 1000);

        const order = await Order.create({
            invoice_number: invoiceNumber,
            userId: userId,
            productId: product.id,
            customer_id: customerId,
            zone_id: zoneId || null,
            customer_name: customerName,
            whatsapp_number: whatsappNumber,
            price: price,
            fee: fee,
            total_amount: totalAmount > 0 ? totalAmount : 0,
            promo_discount: promoDiscount + couponDiscount,
            promo_code_used: promoCode || null,
            points_used: pointsUsed,
            points_earned: Math.floor(totalAmount * 0.05),
            payment_method: paymentMethod,
            payment_channel: paymentMethod,
            payment_status: 'Unpaid',
            order_status: 'Pending'
        });

        // Demo Mode: skip PrismaLink API, redirect ke invoice lokal
        if (whatsappNumber) {
            const msg = `Halo ${customerName || 'Kak'},\n\nInvoice *${invoiceNumber}* telah dibuat.\nProduk: ${product.Voucher?.name} - ${product.name}\nTotal: Rp ${totalAmount.toLocaleString('id-ID')}\n\nSegera lakukan pembayaran.`;
            whatsappService.sendMessage(whatsappNumber, msg);
        }

        if (isDemoMode(req)) {
            return res.status(201).json({
                success: true,
                invoice_number: invoiceNumber,
                checkout_url: null,
                demo: true
            });
        }

        // Production Mode: request ke PrismaLink
        const prismalinkParams = {
            method: paymentMethod,
            merchant_ref: invoiceNumber,
            amount: totalAmount,
            customer_name: customerName || 'Guest User',
            customer_email: 'guest@samstore.com',
            customer_phone: whatsappNumber || '081234567890',
            product_name: `${product.Voucher?.name} - ${product.name}`,
            sku: product.sku,
            return_url: `http://localhost:3000/invoice/${invoiceNumber}`
        };

        const PrismalinkService = require('../services/prismalinkService');
        const prismalinkService = new PrismalinkService(req.tenantConfig?.prismalinkMerchantId, req.tenantConfig?.prismalinkSecretKey);
        const prismalinkResponse = await prismalinkService.createClosedPayment(prismalinkParams);

        if (prismalinkResponse && prismalinkResponse.success) {
            await order.update({
                payment_url: prismalinkResponse.data.checkout_url,
                gateway_reference: prismalinkResponse.data.reference
            });

            res.status(201).json({
                success: true,
                invoice_number: invoiceNumber,
                checkout_url: prismalinkResponse.data.checkout_url
            });
        } else {
            await order.destroy();
            res.status(400).json({ message: 'Gagal membuat pembayaran PrismaLink', detail: prismalinkResponse });
        }

    } catch (error) {
        next(error);
    }
};

exports.prismalinkCallback = async (req, res, next) => {
    try {
        const { Order, Product, User } = req.db.models;
        const PrismalinkService = require('../services/prismalinkService');
        const prismalinkService = new PrismalinkService(req.tenantConfig?.prismalinkMerchantId, req.tenantConfig?.prismalinkSecretKey);
        const isValid = prismalinkService.verifyCallbackSignature(req);
        if (!isValid) return res.status(400).json({ success: false, message: 'Invalid signature' });

        const data = req.body;
        const invoiceNumber = data.merchant_ref;
        const status = data.status;

        const order = await Order.findOne({ where: { invoice_number: invoiceNumber }, include: Product });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.payment_status === 'Paid') {
            return res.json({ success: true, message: 'Already processed' });
        }

        if (status === 'PAID') {
            await order.update({ payment_status: 'Paid', order_status: 'Processing' });

            try {
                const targetId = order.zone_id ? `${order.customer_id}${order.zone_id}` : order.customer_id;

                // --- SaaS Logic: Deduct Tenant Balance first ---
                const hargaModal = parseFloat(order.Product?.price_buy || 0);
                const currentBalance = parseFloat(req.tenant.balance || 0);

                if (currentBalance < hargaModal) {
                    throw new Error(`Saldo tenant tidak mencukupi untuk memproses order ini. Saldo: ${currentBalance}, Butuh: ${hargaModal}`);
                }

                // Potong saldo
                req.tenant.balance = currentBalance - hargaModal;
                await req.tenant.save();

                // Catat mutasi
                const TenantBalanceLog = require('../master_models/TenantBalanceLog');
                await TenantBalanceLog.create({
                    tenantId: req.tenant.id,
                    type: 'topup_deduct',
                    amount: hargaModal,
                    balanceBefore: currentBalance,
                    balanceAfter: req.tenant.balance,
                    note: `Deduct untuk order ${invoiceNumber} (${order.Product?.name})`,
                    orderId: invoiceNumber
                });
                // -----------------------------------------------

                const { DigiflazzService } = require('../services/digiflazzService');
                // Menggunakan akun SuperAdmin PUSAT dari env (atau PlatformSetting)
                const dfService = new DigiflazzService(
                    process.env.DIGIFLAZZ_USERNAME,
                    process.env.DIGIFLAZZ_KEY
                );

                const refIdToDigi = `${req.tenant.subdomain}-${invoiceNumber}`;
                const digiRes = await dfService.createTransaction(order.Product.sku, targetId, refIdToDigi);

                // Catat transaksi server ke ProviderLog
                const ProviderLog = require('../master_models/ProviderLog');
                await ProviderLog.create({
                    providerName: 'digiflazz',
                    eventType: 'topup_result',
                    payload: JSON.stringify(digiRes),
                    status: (digiRes.status === 'Sukses' ? 'success' : 'pending'),
                    errorMessage: digiRes.message || null
                });

                await order.update({
                    order_status: 'Success',
                    provider_order_id: digiRes.ref_id
                });

                // --- Financial Report & Saving Pots ---
                try {
                    const financeController = require('./financeController');
                    const revenue = parseFloat(order.price || 0);
                    const modal = parseFloat(order.Product?.price_buy || 0);
                    const fee = parseFloat(order.fee || 0);
                    const profit = revenue - modal - fee;
                    await financeController.distributeProfitToSavings(profit, order.id, order.invoice_number);
                } catch (finErr) {
                    console.error("Finance Profit Split failed:", finErr);
                }
                // --------------------------------------

                let ticketsEarned = 0;
                if (order.userId) {
                    if (order.points_earned > 0) {
                        await User.increment('points', { by: order.points_earned, where: { id: order.userId } });
                    }

                    const { Setting } = require('../models');
                    let gachaSetting = await Setting.findOne({ where: { key: 'gacha_min_transaction' } });
                    const minTransaction = gachaSetting ? parseInt(gachaSetting.value) : 50000;

                    if (minTransaction > 0 && order.total_amount >= minTransaction) {
                        ticketsEarned = Math.floor(order.total_amount / minTransaction);
                        if (ticketsEarned > 0) {
                            await User.increment('tickets', { by: ticketsEarned, where: { id: order.userId } });
                            await order.update({ tickets_earned: ticketsEarned });
                        }
                    }
                }

                if (order.whatsapp_number) {
                    let additionalMsg = '';
                    if (order.points_earned > 0) additionalMsg += `🎁 Kamu mendapat ${order.points_earned} Poin Loyalty!\n`;
                    if (ticketsEarned > 0) additionalMsg += `🎮 Keren! Kamu dapat ${ticketsEarned} Tiket Gacha. Yuk putar roda di Dashboard!\n`;

                    const msg = `Halo,\n\nPembayaran untuk *${invoiceNumber}* telah kami terima.\nPesanan Anda *${order.Product?.name}* diproses dan Sukses!\nTerima kasih telah berbelanja.\n\n${additionalMsg}`;
                    whatsappService.sendMessage(order.whatsapp_number, msg);
                }

            } catch (digiErr) {
                console.error("DigiFlazz Topup failed during callback:", digiErr);
                await order.update({ order_status: 'Failed' });

                // --- SaaS Logic: Refund Tenant Balance ---
                try {
                    const hargaModal = parseFloat(order.Product?.price_buy || 0);
                    if (hargaModal > 0 && req.tenant) {
                        const currentBalance = parseFloat(req.tenant.balance || 0);
                        req.tenant.balance = currentBalance + hargaModal;
                        await req.tenant.save();

                        const TenantBalanceLog = require('../master_models/TenantBalanceLog');
                        await TenantBalanceLog.create({
                            tenantId: req.tenant.id,
                            type: 'refund',
                            amount: hargaModal,
                            balanceBefore: currentBalance,
                            balanceAfter: req.tenant.balance,
                            note: `Refund order gagal ${invoiceNumber} (${order.Product?.name})`,
                            orderId: invoiceNumber
                        });
                    }
                } catch (refundErr) {
                    console.error("Gagal melakukan refund saldo tenant:", refundErr);
                }
                // ------------------------------------------

                if (order.whatsapp_number) {
                    const msg = `Halo,\n\nPembayaran untuk *${invoiceNumber}* berhasil diterima, namun pesanan GAGAL diproses oleh server provider. Silakan hubungi Admin untuk refund.`;
                    whatsappService.sendMessage(order.whatsapp_number, msg);
                }
            }

            return res.json({ success: true });
        } else if (status === 'EXPIRED' || status === 'FAILED') {
            await order.update({ payment_status: 'Failed', order_status: 'Failed' });
            if (order.userId && order.points_used > 0) {
                await User.increment('points', { by: order.points_used, where: { id: order.userId } });
            }
            if (order.whatsapp_number) {
                const msg = `Halo,\n\nInvoice *${invoiceNumber}* telah Expired/Gagal. Silakan buat pesanan baru.`;
                whatsappService.sendMessage(order.whatsapp_number, msg);
            }
            return res.json({ success: true });
        }

        res.json({ success: true, message: 'Status ignored' });
    } catch (error) {
        next(error);
    }
};

exports.getOrderByInvoice = async (req, res, next) => {
    try {
        const { Order, Product, Voucher } = req.db.models;
        const order = await Order.findOne({
            where: { invoice_number: req.params.invoiceNumber },
            include: [{ model: Product, include: [Voucher] }]
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        next(error);
    }
};

exports.digiflazzWebhook = async (req, res, next) => {
    try {
        const crypto = require('crypto');
        const signature = req.headers['x-hub-signature'];
        const eventName = req.headers['x-digiflazz-event'];

        if (!signature || !eventName) {
            return res.status(400).json({ message: 'Invalid headers' });
        }

        // Ambil key Digiflazz Super Admin (karena semua trx via Super Admin)
        const dfKey = process.env.DIGIFLAZZ_KEY || 'your_digiflazz_key';

        // Verifikasi Signature
        const payloadStr = JSON.stringify(req.body);
        const expectedSig = 'sha1=' + crypto.createHmac('sha1', dfKey).update(payloadStr).digest('hex');

        if (signature !== expectedSig) {
            console.error('[DigiFlazz Webhook] Signature mismatch');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const data = req.body.data;
        if (!data || !data.ref_id) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        const refIdParts = data.ref_id.split('-');
        let invoiceNumber = data.ref_id;
        let tenantSubdomain = 'budi'; // fallback

        if (refIdParts.length > 2 && refIdParts[1] === 'INV') {
            // ref_id kita formatnya: [subdomain]-INV-[timestamp]-[rand]
            tenantSubdomain = refIdParts[0];
            invoiceNumber = refIdParts.slice(1).join('-');
        } else {
            invoiceNumber = data.ref_id;
        }

        const Tenant = require('../master_models/Tenant');
        const { getTenantConnection } = require('../services/dbPoolManager');

        const tenant = await Tenant.findOne({ where: { subdomain: tenantSubdomain } });
        if (!tenant) {
            console.error('[DigiFlazz Webhook] Tenant not found:', tenantSubdomain);
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const dbConn = await getTenantConnection(tenant);
        const { Order, Product, User } = dbConn.models;

        const order = await Order.findOne({
            where: { invoice_number: invoiceNumber },
            include: [{ model: Product, attributes: ['price_buy', 'name'] }]
        });

        if (!order) {
            console.error('[DigiFlazz Webhook] Order not found:', invoiceNumber);
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.order_status === 'Success' || order.order_status === 'Failed') {
            return res.json({ message: 'Already processed' });
        }

        console.log(`[DigiFlazz Webhook] Update Order ${invoiceNumber} to ${data.status} (RC: ${data.rc})`);

        if (data.status === 'Sukses') {
            await order.update({
                order_status: 'Success',
                sn: data.sn || null
            });

            // --- Trigger Profit Savings ---
            const prevStatus = order.order_status;
            if (prevStatus !== 'Success') {
                const financeController = require('./financeController');
                const revenue = parseFloat(order.price || 0);
                const modal = parseFloat(order.Product?.price_buy || 0);
                const fee = parseFloat(order.fee || 0);
                const profit = revenue - modal - fee;
                await financeController.distributeProfitToSavings(profit, order.id, order.invoice_number);
            }
            // -------------------------------

            if (order.whatsapp_number) {
                const msg = `Halo,\n\nPesanan Anda *${order.Product?.name}* dengan Invoice *${invoiceNumber}* Telah SUKSES!\nSN: ${data.sn || '-'}\nTerima kasih telah berbelanja!`;
                whatsappService.sendMessage(order.whatsapp_number, msg);
            }

        } else if (data.status === 'Gagal') {
            await order.update({ order_status: 'Failed' });

            // --- SaaS Logic: Refund Tenant Balance ---
            try {
                const hargaModal = parseFloat(order.Product?.price_buy || 0);
                if (hargaModal > 0 && tenant) {
                    const currentBalance = parseFloat(tenant.balance || 0);
                    tenant.balance = currentBalance + hargaModal;
                    await tenant.save();

                    const TenantBalanceLog = require('../master_models/TenantBalanceLog');
                    await TenantBalanceLog.create({
                        tenantId: tenant.id,
                        type: 'refund',
                        amount: hargaModal,
                        balanceBefore: currentBalance,
                        balanceAfter: tenant.balance,
                        note: `Refund order gagal (Webhook) ${invoiceNumber}`,
                        orderId: invoiceNumber
                    });
                }
            } catch (refundErr) {
                console.error("Gagal melakukan refund saldo tenant di Webhook:", refundErr);
            }
            // ------------------------------------------

            if (order.whatsapp_number) {
                const msg = `Halo,\n\nPesanan Anda *${order.Product?.name}* (Invoice: *${invoiceNumber}*) GAGAL diproses oleh provider. Silakan hubungi Admin untuk bantuan.`;
                whatsappService.sendMessage(order.whatsapp_number, msg);
            }
        } else if (data.status === 'Pending') {
            await order.update({ order_status: 'Pending' });
        }

        res.json({ success: true, message: 'Webhook processed' });
    } catch (error) {
        console.error('[DigiFlazz Webhook] Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
