const { SpinPrize, User, Setting } = require('../models');

// --- ADMIN ENDPOINTS ---

exports.getAllPrizes = async (req, res) => {
    try {
        const prizes = await SpinPrize.findAll();
        res.json(prizes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPrize = async (req, res) => {
    try {
        const prize = await SpinPrize.create(req.body);
        res.status(201).json(prize);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePrize = async (req, res) => {
    try {
        const prize = await SpinPrize.findByPk(req.params.id);
        if (!prize) return res.status(404).json({ message: 'Hadiah tidak ditemukan' });
        await prize.update(req.body);
        res.json(prize);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deletePrize = async (req, res) => {
    try {
        const prize = await SpinPrize.findByPk(req.params.id);
        if (!prize) return res.status(404).json({ message: 'Hadiah tidak ditemukan' });
        await prize.destroy();
        res.json({ message: 'Hadiah dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getGachaSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne({ where: { key: 'gacha_min_transaction' } });
        if (!setting) {
            setting = await Setting.create({ key: 'gacha_min_transaction', value: '50000' });
        }
        res.json({ min_transaction: setting.value });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateGachaSettings = async (req, res) => {
    try {
        const { min_transaction } = req.body;
        let setting = await Setting.findOne({ where: { key: 'gacha_min_transaction' } });
        if (setting) {
            await setting.update({ value: min_transaction });
        } else {
            await Setting.create({ key: 'gacha_min_transaction', value: min_transaction });
        }
        res.json({ message: 'Minimal transaksi diperbarui' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- USER ENDPOINTS ---

// GET /api/auth/spin-wheel/prizes (Mengambil daftar hadiah yg ditata di roda untuk Frontend)
exports.getWheelPrizes = async (req, res) => {
    try {
        const prizes = await SpinPrize.findAll({ where: { is_active: true } });
        res.json(prizes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/auth/spin-wheel (Eksekusi Gacha)
exports.spinWheel = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user || user.tickets < 1) {
            return res.status(400).json({ success: false, message: 'Tiket tidak cukup!' });
        }

        const prizes = await SpinPrize.findAll({ where: { is_active: true } });
        if (prizes.length === 0) {
            return res.status(400).json({ success: false, message: 'Hadiah gacha belum dietting Admin' });
        }

        // Kalkulasi Total Bobot
        const totalWeight = prizes.reduce((sum, item) => sum + parseInt(item.chance_weight), 0);
        let randomNum = Math.floor(Math.random() * totalWeight);

        let wonPrize = null;
        for (const prize of prizes) {
            if (randomNum < parseInt(prize.chance_weight)) {
                wonPrize = prize;
                break;
            }
            randomNum -= parseInt(prize.chance_weight);
        }

        // Default safety
        if (!wonPrize) wonPrize = prizes[0];

        // Kurangi 1 tiket
        await user.decrement('tickets', { by: 1 });
        await user.reload(); // Refresh from DB to get accurate count

        // Berikan hadiah jika points
        if (wonPrize.type === 'points' && wonPrize.value > 0) {
            await user.increment('points', { by: wonPrize.value });
        }

        // Return won prize index so UI knows what pie piece to land on
        // Plus updated balance stats
        res.json({
            success: true,
            prize_id: wonPrize.id,
            prize_name: wonPrize.name,
            prize_type: wonPrize.type,
            prize_value: wonPrize.value,
            remaining_tickets: user.tickets
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
