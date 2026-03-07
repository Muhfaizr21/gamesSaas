const { Op } = require('sequelize');

const adminController = {
    // --- DigiFlazz Sync Status ---
    getSyncStatus: (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { getSyncStatus } = require('../services/digiflazzService');
            const status = getSyncStatus();
            res.json(status);
        } catch (e) {
            res.status(500).json({ error: true, message: e.message });
        }
    },

    // --- Dashboard Data ---
    getDashboardStats: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { DigiflazzService } = require('../services/digiflazzService');
            let digiflazzBalance = 0;
            try {
                // Gunakan akun pusat jika req.tenantConfig kosong (SuperAdmin fallback) atau gunakan milik tenant
                const dfUsername = req.tenantConfig?.digiflazzUsername || process.env.DIGIFLAZZ_USERNAME;
                const dfKey = req.tenantConfig?.digiflazzKey || process.env.DIGIFLAZZ_KEY;

                const dfService = new DigiflazzService(dfUsername, dfKey);
                const balanceData = await dfService.checkBalance();
                if (balanceData && balanceData.deposit !== undefined) {
                    digiflazzBalance = balanceData.deposit;
                }
            } catch (err) {
                console.error("Gagal mendapatkan saldo Digiflazz di Dashboard:", err.message);
            }

            // Run all count/sum in parallel for speed
            const [totalUsers, totalOrders, totalRevenue, recentOrders] = await Promise.all([
                User.count(),
                Order.count(),
                Order.sum('price', {
                    where: { payment_status: 'Paid', order_status: 'Success' }
                }),
                Order.findAll({
                    limit: 5,
                    order: [['created_at', 'DESC']],
                    attributes: ['id', 'invoice_number', 'price', 'total_amount', 'payment_status', 'order_status', 'created_at'],
                    include: [{
                        model: Product,
                        attributes: ['name'],
                    }]
                })
            ]);

            res.json({
                totalUsers,
                totalOrders,
                totalRevenue: totalRevenue || 0,
                recentOrders,
                digiflazzBalance // Tambahkan ini
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching dashboard stats', error });
        }
    },

    getAnalytics: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const days = 7;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const salesData = await Order.findAll({
                where: {
                    payment_status: 'Paid',
                    order_status: 'Success',
                    created_at: { [Op.gte]: startDate }
                },
                attributes: [
                    [req.db.fn('DATE', req.db.col('created_at')), 'date'],
                    [req.db.fn('SUM', req.db.col('price')), 'totalSales'],
                    [req.db.fn('COUNT', req.db.col('id')), 'totalOrders']
                ],
                group: [req.db.fn('DATE', req.db.col('created_at'))],
                order: [[req.db.fn('DATE', req.db.col('created_at')), 'ASC']]
            });

            res.json(salesData);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching analytics', error: error.message });
        }
    },

    // --- Category Management ---
    createCategory: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const category = await Category.create(req.body);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: 'Error creating category', error: error.message });
        }
    },

    getAllCategories: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const categories = await Category.findAll({ order: [['name', 'ASC']] });
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error });
        }
    },

    updateCategory: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { id } = req.params;
            const [updated] = await Category.update(req.body, { where: { id } });
            if (updated) {
                return res.json(await Category.findByPk(id));
            }
            res.status(404).json({ message: 'Category not found' });
        } catch (error) {
            res.status(400).json({ message: 'Error updating category', error: error.message });
        }
    },

    deleteCategory: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { id } = req.params;
            const deleted = await Category.destroy({ where: { id } });
            if (deleted) return res.json({ message: 'Category deleted' });
            res.status(404).json({ message: 'Category not found' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting category', error });
        }
    },

    // --- Voucher Management ---
    createVoucher: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const voucher = await Voucher.create(req.body);
            res.status(201).json(voucher);
        } catch (error) {
            res.status(400).json({ message: 'Error creating voucher', error: error.message });
        }
    },

    getAllVouchers: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const vouchers = await Voucher.findAll({
                include: [{ model: Category, attributes: ['id', 'name'] }],
                order: [['name', 'ASC']]
            });
            res.json(vouchers);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching vouchers', error });
        }
    },

    updateVoucher: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { id } = req.params;
            const [updated] = await Voucher.update(req.body, { where: { id } });
            if (updated) {
                return res.json(await Voucher.findByPk(id));
            }
            res.status(404).json({ message: 'Voucher not found' });
        } catch (error) {
            res.status(400).json({ message: 'Error updating voucher', error: error.message });
        }
    },

    deleteVoucher: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { id } = req.params;
            const deleted = await Voucher.destroy({ where: { id } });
            if (deleted) return res.json({ message: 'Voucher deleted' });
            res.status(404).json({ message: 'Voucher not found' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting voucher', error });
        }
    },

    // --- Product Management ---
    createProduct: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const product = await Product.create(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ message: 'Error creating product', error: error.message });
        }
    },

    getAllProducts: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const products = await Product.findAll({
                include: [{ model: Voucher, attributes: ['id', 'name', 'slug'] }],
                order: [['price_sell', 'ASC']]
            });
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching products', error });
        }
    },

    updateProduct: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { id } = req.params;
            const [updated] = await Product.update(req.body, { where: { id } });
            if (updated) {
                return res.json(await Product.findByPk(id));
            }
            res.status(404).json({ message: 'Product not found' });
        } catch (error) {
            res.status(400).json({ message: 'Error updating product', error: error.message });
        }
    },

    deleteProduct: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { id } = req.params;
            const deleted = await Product.destroy({ where: { id } });
            if (deleted) return res.json({ message: 'Product deleted' });
            res.status(404).json({ message: 'Product not found' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting product', error });
        }
    },

    syncDigiflazzProducts: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { DigiflazzService } = require('../services/digiflazzService');
            const dfService = new DigiflazzService(req.tenantConfig?.digiflazzUsername, req.tenantConfig?.digiflazzKey);

            const digiProducts = await dfService.getPriceList();

            if (!Array.isArray(digiProducts)) {
                return res.status(400).json({
                    message: digiProducts?.message || "Koneksi ke DigiFlazz gagal. Harap cek User, Key, dan pastikan IP server sudah didaftarkan (Whitelist) di panel DigiFlazz.",
                    error_code: digiProducts?.rc
                });
            }

            const allowedCategories = ['games', 'china topup', 'malaysia topup', 'philippines topup'];
            const allGameProducts = digiProducts.filter(p =>
                p.category && allowedCategories.includes(p.category.toLowerCase())
            );

            if (allGameProducts.length === 0) {
                return res.json({ message: "Tidak ada produk kategori Games dari DigiFlazz", total: 0, synced: 0 });
            }

            const ALLOWED_BRANDS = [
                'garena', 'mobile legends', 'point blank', 'free fire',
                'arena of valor', 'pubg mobile', 'call of duty mobile',
                'lords mobile', 'valorant', 'one punch man', 'sausage man',
                'genshin impact', 'league of legends wild rift', 'state of survival',
                'stumble guys', 'honkai impact 3', 'ragnarok origin',
                'revelation infinite journey', 'honkai star rail', 'fc mobile',
                'league of legends pc', 'honor of kings', 'blood strike',
                'mobile legends adventure', 'free fire max', 'pokemon unite',
                'magic chess', 'delta force', 'haikyu fly high', 'dragon city',
                'ragnarok twilight', 'bleach soul resonance', 'crossfire'
            ];

            const brandFilteredProducts = allGameProducts.filter(p =>
                p.brand && ALLOWED_BRANDS.includes(p.brand.toLowerCase())
            );

            if (brandFilteredProducts.length === 0) {
                return res.json({ message: "Tidak ada produk dari brand yang diizinkan", total: 0, synced: 0 });
            }

            const activeGameProducts = brandFilteredProducts.filter(p => p.buyer_product_status === true);

            const [gameCategory] = await Category.findOrCreate({
                where: { slug: 'games' },
                defaults: { name: 'Games', description: 'Kategori Topup Game' }
            });

            // Cleanup non-allowed brands
            const allVouchers = await Voucher.findAll({ attributes: ['id', 'name'] });
            let deletedBrandCount = 0;
            let deletedProductCount = 0;

            for (const voucher of allVouchers) {
                if (!ALLOWED_BRANDS.includes(voucher.name.toLowerCase())) {
                    const deleted = await Product.destroy({ where: { voucherId: voucher.id } });
                    deletedProductCount += deleted;
                    await Voucher.destroy({ where: { id: voucher.id } });
                    deletedBrandCount++;
                }
            }

            // Batch upsert — collect all SKUs first to avoid N+1
            const incomingSkus = activeGameProducts.map(p => p.buyer_sku_code);
            const existingProducts = await Product.findAll({
                where: { sku: { [Op.in]: incomingSkus } },
                attributes: ['id', 'sku', 'price_sell']
            });
            const existingSkuMap = new Map(existingProducts.map(p => [p.sku, p]));

            let newCount = 0;
            let updatedCount = 0;

            for (const item of activeGameProducts) {
                const brandSlug = item.brand.toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                const [voucher] = await Voucher.findOrCreate({
                    where: { slug: brandSlug },
                    defaults: { name: item.brand, categoryId: gameCategory.id, isActive: true }
                });

                const existing = existingSkuMap.get(item.buyer_sku_code);

                if (existing) {
                    await Product.update({
                        name: item.product_name,
                        price_buy: item.price,
                        isActive: item.seller_product_status,
                        stock: item.unlimited_stock ? -1 : item.stock,
                        voucherId: voucher.id,  // Ensure FK is always correct on re-sync
                        multi: item.multi || false,
                        cut_off_start: item.start_cut_off || null,
                        cut_off_end: item.end_cut_off || null,
                        provider_desc: item.desc || null
                    }, { where: { sku: item.buyer_sku_code } });
                    updatedCount++;
                } else {
                    const defaultSellPrice = Math.ceil((item.price * 1.1) / 100) * 100;
                    await Product.create({
                        name: item.product_name,
                        sku: item.buyer_sku_code,
                        price_buy: item.price,
                        price_sell: defaultSellPrice,
                        stock: item.unlimited_stock ? -1 : item.stock,
                        isActive: item.seller_product_status,
                        voucherId: voucher.id,
                        multi: item.multi || false,
                        cut_off_start: item.start_cut_off || null,
                        cut_off_end: item.end_cut_off || null,
                        provider_desc: item.desc || null
                    });
                    newCount++;
                }
            }

            res.json({
                message: `Sinkronisasi berhasil! ${newCount} produk baru ditambahkan, ${updatedCount} produk diperbarui. ${deletedBrandCount} brand non-game dihapus (${deletedProductCount} produk).`,
                total_from_api: allGameProducts.length,
                active_buyer_products: activeGameProducts.length,
                new: newCount,
                updated: updatedCount,
                deleted_brands: deletedBrandCount,
                deleted_products: deletedProductCount
            });

        } catch (error) {
            console.error("Sync Digiflazz Error:", error);
            res.status(500).json({ message: 'Gagal sinkronisasi dengan DigiFlazz', error: error.message });
        }
    },

    // --- Pricing & Margins ---
    updateProductMargin: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { marginPercentage, voucherId } = req.body;

            if (marginPercentage === undefined || typeof marginPercentage !== 'number') {
                return res.status(400).json({ message: 'Valid marginPercentage is required' });
            }

            const marginMultiplier = 1 + (marginPercentage / 100);
            const whereClause = voucherId === 'all' || !voucherId ? {} : { voucherId };

            // Fetch only needed columns
            const products = await Product.findAll({
                where: whereClause,
                attributes: ['id', 'price_buy', 'price_sell']
            });

            let updatedCount = 0;
            const updatePromises = [];

            for (const product of products) {
                if (Number(product.price_buy) > 0) {
                    const roundedPrice = Math.ceil(Math.ceil(Number(product.price_buy) * marginMultiplier) / 100) * 100;
                    if (Number(product.price_sell) !== roundedPrice) {
                        updatePromises.push(product.update({ price_sell: roundedPrice }));
                        updatedCount++;
                    }
                }
            }

            // Run all updates in parallel
            await Promise.all(updatePromises);

            res.json({ message: `Berhasil mengatur margin ${marginPercentage}%`, updatedCount });

        } catch (error) {
            console.error("Update Margin Error:", error);
            res.status(500).json({ message: 'Gagal memperbarui margin harga', error: error.message });
        }
    },

    // --- Order Management ---
    getAllOrders: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { limit = 100, offset = 0, status } = req.query;
            const where = status ? { order_status: status } : {};

            const orders = await Order.findAll({
                where,
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'sku']
                }, {
                    model: User,
                    attributes: ['id', 'name', 'whatsapp'],
                    required: false
                }]
            });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching orders', error });
        }
    },

    updateOrderStatus: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { id } = req.params;
            const { payment_status, order_status } = req.body;

            const order = await Order.findByPk(id, {
                include: [{ model: Product, attributes: ['price_buy'] }]
            });
            if (!order) return res.status(404).json({ message: 'Order not found' });

            const prevStatus = order.order_status;
            await order.update({ payment_status, order_status });

            // Trigger SaaS balance deduction if manual success (and not already deducted)
            let hargaModal = 0;
            if (order_status === 'Success' && prevStatus !== 'Success') {
                // Deduct balance from tenant (master database)
                hargaModal = parseFloat(order.Product?.price_buy || 0);
                if (hargaModal > 0 && req.tenant) {
                    const currentBalance = parseFloat(req.tenant.balance || 0);
                    if (currentBalance >= hargaModal) {
                        req.tenant.balance = currentBalance - hargaModal;
                        await req.tenant.save();
                        // Invalidate cache agar saldo fresh di request selanjutnya
                        const { invalidateTenantCache } = require('../middlewares/tenantMiddleware');
                        invalidateTenantCache(req.tenant.subdomain);

                        // Log balance deduction
                        const TenantBalanceLog = require('../master_models/TenantBalanceLog');
                        await TenantBalanceLog.create({
                            tenantId: req.tenant.id,
                            type: 'topup_deduct',
                            amount: hargaModal,
                            balanceBefore: currentBalance,
                            balanceAfter: req.tenant.balance,
                            note: `Manual Success: Deduct untuk order ${order.invoice_number}`,
                            orderId: order.invoice_number
                        });
                    } else {
                        console.warn(`[Warning] Manual Success for ${order.invoice_number} but tenant balance insufficient! Saldo: ${currentBalance}, Butuh: ${hargaModal}`);
                    }
                }

                // Trigger profit distribution (pass req.db untuk multi-tenant finance)
                const financeController = require('./financeController');
                const revenue = parseFloat(order.price || 0);
                const fee = parseFloat(order.fee || 0);
                const profit = revenue - hargaModal - fee;

                await financeController.distributeProfitToSavings(profit, order.id, order.invoice_number, req.db);
            }

            res.json(order);
        } catch (error) {
            console.error("Update order status error:", error);
            res.status(400).json({ message: 'Error updating order status', error: error.message });
        }
    },

    // --- User Management ---
    getAllUsers: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password'] },
                order: [['created_at', 'DESC']]
            });
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users', error });
        }
    },

    updateUserRole: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { id } = req.params;
            const { role } = req.body;
            const [updated] = await User.update({ role }, { where: { id } });
            if (updated) return res.json({ message: 'User role updated successfully' });
            res.status(404).json({ message: 'User not found' });
        } catch (error) {
            res.status(400).json({ message: 'Error updating user role', error: error.message });
        }
    },

    adjustUserBalance: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { id } = req.params;
            const { amount, type } = req.body;

            const user = await User.findByPk(id, { attributes: ['id', 'balance'] });
            if (!user) return res.status(404).json({ message: 'User not found' });

            let newBalance = parseFloat(user.balance || 0);
            if (type === 'add') newBalance += parseFloat(amount);
            else if (type === 'deduct') newBalance -= parseFloat(amount);

            user.balance = newBalance;
            await user.save();

            res.json({ message: 'User balance updated', balance: user.balance });
        } catch (error) {
            res.status(400).json({ message: 'Error adjusting user balance', error: error.message });
        }
    },

    // --- Deposit Management ---
    getAllDeposits: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const deposits = await Deposit.findAll({
                include: [{ model: User, attributes: ['name', 'email', 'whatsapp'] }],
                order: [['created_at', 'DESC']],
                limit: 200
            });
            res.json(deposits);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching deposits', error });
        }
    },

    approveDeposit: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { id } = req.params;

            const deposit = await Deposit.findByPk(id);
            if (!deposit || deposit.status !== 'Pending')
                return res.status(400).json({ message: 'Invalid deposit request' });

            const user = await User.findByPk(deposit.userId, { attributes: ['id', 'balance'] });
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Update balance and status in parallel
            await Promise.all([
                user.update({ balance: parseFloat(user.balance || 0) + parseFloat(deposit.amount) }),
                deposit.update({ status: 'Success' })
            ]);

            res.json({ message: 'Deposit approved' });
        } catch (error) {
            res.status(500).json({ message: 'Error approving deposit', error });
        }
    },

    rejectDeposit: async (req, res) => {
        const { Category, Voucher, Product, Order, User, Deposit } = req.db.models;
        try {
            const { id } = req.params;
            const deposit = await Deposit.findByPk(id, { attributes: ['id', 'status'] });
            if (!deposit || deposit.status !== 'Pending')
                return res.status(400).json({ message: 'Invalid deposit request' });

            await deposit.update({ status: 'Failed' });
            res.json({ message: 'Deposit rejected' });
        } catch (error) {
            res.status(500).json({ message: 'Error rejecting deposit', error });
        }
    }
};

module.exports = adminController;
