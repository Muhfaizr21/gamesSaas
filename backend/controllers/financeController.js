const { Op } = require('sequelize');

// ─────────────────────────────────────────────
// UTILITY: Split profit to all 3 saving pots
// MULTI-TENANT: Perlu di-pass db dari req.db agar pakai database tenant yang benar
// ─────────────────────────────────────────────
async function distributeProfitToSavings(profit, orderId, invoiceNumber, db) {
    if (profit <= 0) return;

    // Gunakan db yang di-pass (tenant-specific), fallback ke require('../models') hanya jika tidak ada
    const { SavingPot, SavingTransaction } = db ? db.models : require('../models');

    const pots = await SavingPot.findAll();
    if (pots.length === 0) return;

    const totalAlloc = pots.reduce((sum, p) => sum + parseFloat(p.allocation_percent), 0);
    if (totalAlloc === 0) return;

    for (const pot of pots) {
        // Calculate share proportionally even if % doesn't sum to exactly 100
        const share = (parseFloat(pot.allocation_percent) / totalAlloc) * profit;
        const rounded = Math.floor(share * 100) / 100; // Floor to 2 decimals

        await SavingTransaction.create({
            saving_pot_id: pot.id,
            type: 'income',
            amount: rounded,
            description: `Profit dari transaksi #${invoiceNumber}`,
            order_id: orderId,
            order_invoice: invoiceNumber
        });

        await pot.increment('balance', { by: rounded });
    }
}

module.exports.distributeProfitToSavings = distributeProfitToSavings;

// ─────────────────────────────────────────────
// GET /api/admin/finance/report
// ─────────────────────────────────────────────
exports.getReport = async (req, res) => {
    const { Order, Product } = req.db.models;
    try {
        const { period = 'all' } = req.query;

        let dateFilter = {};
        const now = new Date();
        if (period === 'today') {
            dateFilter = {
                created_at: {
                    [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate())
                }
            };
        } else if (period === '7d') {
            dateFilter = {
                created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            };
        } else if (period === '30d') {
            dateFilter = {
                created_at: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            };
        } else if (period === 'month') {
            dateFilter = {
                created_at: {
                    [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1)
                }
            };
        }

        // Fetch all successful orders in period (dari tenant's own DB)
        const orders = await Order.findAll({
            where: {
                payment_status: 'Paid',
                order_status: 'Success',
                ...dateFilter
            },
            include: [{
                model: Product,
                attributes: ['price_buy', 'name']
            }],
            order: [['created_at', 'DESC']],
            limit: 500
        });

        let totalRevenue = 0;
        let totalModal = 0;
        let totalFee = 0;
        let totalProfit = 0;

        const orderDetails = orders.map(o => {
            const revenue = parseFloat(o.price || 0);
            const modal = parseFloat(o.Product?.price_buy || 0);
            const fee = parseFloat(o.fee || 0);
            const profit = revenue - modal - fee;

            totalRevenue += revenue;
            totalModal += modal;
            totalFee += fee;
            totalProfit += profit;

            return {
                id: o.id,
                invoice_number: o.invoice_number,
                product_name: o.Product?.name || '-',
                revenue,
                modal,
                fee,
                profit,
                created_at: o.created_at || o.createdAt
            };
        });

        const margin = totalRevenue > 0
            ? ((totalProfit / totalRevenue) * 100).toFixed(2)
            : 0;

        res.json({
            period,
            summary: {
                total_orders: orders.length,
                total_revenue: totalRevenue,
                total_modal: totalModal,
                total_fee: totalFee,
                total_profit: totalProfit,
                margin_percent: parseFloat(margin)
            },
            orders: orderDetails
        });
    } catch (error) {
        console.error('Finance report error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// GET /api/admin/finance/pots
// ─────────────────────────────────────────────
exports.getSavingPots = async (req, res) => {
    const { SavingPot } = req.db.models;
    try {
        const pots = await SavingPot.findAll({ order: [['id', 'ASC']] });
        res.json(pots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// PUT /api/admin/finance/pots/allocation
// Body: { allocations: [{ id, allocation_percent }] }
// ─────────────────────────────────────────────
exports.updateAllocation = async (req, res) => {
    const { SavingPot } = req.db.models;
    try {
        const { allocations } = req.body;
        if (!Array.isArray(allocations) || allocations.length === 0) {
            return res.status(400).json({ message: 'allocations wajib diisi' });
        }

        const total = allocations.reduce((sum, a) => sum + parseFloat(a.allocation_percent), 0);
        if (Math.abs(total - 100) > 0.01) {
            return res.status(400).json({
                message: `Total persentase harus tepat 100%. Saat ini: ${total.toFixed(2)}%`
            });
        }

        for (const alloc of allocations) {
            await SavingPot.update(
                { allocation_percent: alloc.allocation_percent },
                { where: { id: alloc.id } }
            );
        }

        res.json({ message: 'Alokasi persentase berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// POST /api/admin/finance/pots/:id/withdraw
// Body: { amount, description }
// ─────────────────────────────────────────────
exports.addWithdrawal = async (req, res) => {
    const { SavingPot, SavingTransaction } = req.db.models;
    try {
        const { id } = req.params;
        const { amount, description } = req.body;

        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: 'Jumlah penarikan harus lebih dari 0' });
        }

        const pot = await SavingPot.findByPk(id);
        if (!pot) return res.status(404).json({ message: 'Pot tidak ditemukan' });

        if (parseFloat(pot.balance) < parseFloat(amount)) {
            return res.status(400).json({
                message: `Saldo pot tidak cukup. Saldo saat ini: Rp ${Number(pot.balance).toLocaleString('id-ID')}`
            });
        }

        await SavingTransaction.create({
            saving_pot_id: pot.id,
            type: 'withdrawal',
            amount: parseFloat(amount),
            description: description || 'Penarikan manual'
        });

        await pot.decrement('balance', { by: parseFloat(amount) });
        await pot.reload();

        res.json({
            message: 'Penarikan berhasil dicatat',
            remaining_balance: pot.balance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// GET /api/admin/finance/pots/:id/history
// ─────────────────────────────────────────────
exports.getSavingHistory = async (req, res) => {
    const { SavingTransaction } = req.db.models;
    try {
        const { id } = req.params;
        const transactions = await SavingTransaction.findAll({
            where: { saving_pot_id: id },
            order: [['created_at', 'DESC']],
            limit: 200
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// POST /api/admin/finance/recalculate
// Resets all pot balances and re-calculates from all successful orders
// ─────────────────────────────────────────────
exports.recalculate = async (req, res) => {
    const { SavingPot, SavingTransaction, Order, Product } = req.db.models;
    try {
        // 1. Reset semua saldo dan hapus semua income transactions
        await SavingTransaction.destroy({ where: { type: 'income' } });
        await SavingPot.update({ balance: 0 }, { where: {} });

        // 2. Fetch all successful orders dari tenant ini
        const orders = await Order.findAll({
            where: { payment_status: 'Paid', order_status: 'Success' },
            include: [{ model: Product, attributes: ['price_buy'] }],
            order: [['created_at', 'ASC']]
        });

        let distributed = 0;
        for (const order of orders) {
            const revenue = parseFloat(order.price || 0);
            const modal = parseFloat(order.Product?.price_buy || 0);
            const fee = parseFloat(order.fee || 0);
            const profit = revenue - modal - fee;

            await distributeProfitToSavings(profit, order.id, order.invoice_number, req.db);
            distributed++;
        }

        const pots = await SavingPot.findAll();
        res.json({
            message: `Rekalibrasi selesai. ${distributed} transaksi diproses.`,
            pots: pots.map(p => ({ name: p.name, balance: p.balance }))
        });
    } catch (error) {
        console.error('Recalculate error:', error);
        res.status(500).json({ message: error.message });
    }
};
