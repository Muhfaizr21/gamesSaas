const prismalinkService = require('../services/prismalinkService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
        const { User, Order, Deposit, Product, Voucher, Review } = req.db.models;
    try {
        const { name, email, whatsapp, password } = req.body;

        // Validation
        if (!name || (!email && !whatsapp) || !password) {
            return res.status(400).json({ message: 'Name, password, and either email or whatsapp are required.' });
        }

        // Check if user exists
        let existingUser = null;
        if (email) existingUser = await User.findOne({ where: { email } });
        if (!existingUser && whatsapp) existingUser = await User.findOne({ where: { whatsapp } });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or whatsapp already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await User.create({
            name,
            email,
            whatsapp,
            password: hashedPassword
        });

        // Generate token
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                whatsapp: newUser.whatsapp,
                role: newUser.role,
                balance: newUser.balance
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
        const { User, Order, Deposit, Product, Voucher, Review } = req.db.models;
    try {
        const { email, whatsapp, password } = req.body;

        if ((!email && !whatsapp) || !password) {
            return res.status(400).json({ message: 'Please provide email/whatsapp and password.' });
        }

        // Find user by email or whatsapp
        let user = null;
        if (email) user = await User.findOne({ where: { email } });
        if (!user && whatsapp) user = await User.findOne({ where: { whatsapp } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                whatsapp: user.whatsapp,
                role: user.role,
                balance: user.balance
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// Get current user profile
exports.getMe = async (req, res) => {
        const { User, Order, Deposit, Product, Voucher, Review } = req.db.models;
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server error fetching profile', error: error.message });
    }
};

// Update user profile (name, email, whatsapp)
exports.updateProfile = async (req, res) => {
        const { User, Order, Deposit, Product, Voucher, Review } = req.db.models;
    try {
        const { name, email, whatsapp } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ message: 'Nama tidak boleh kosong.' });
        }

        // Check for conflicts on unique fields (exclude self)
        if (email) {
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail && existingEmail.id !== userId) {
                return res.status(400).json({ message: 'Email sudah digunakan akun lain.' });
            }
        }
        if (whatsapp) {
            const existingWa = await User.findOne({ where: { whatsapp } });
            if (existingWa && existingWa.id !== userId) {
                return res.status(400).json({ message: 'Nomor WhatsApp sudah digunakan akun lain.' });
            }
        }

        await User.update({ name, email, whatsapp }, { where: { id: userId } });

        const updatedUser = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
        res.json({ message: 'Profil berhasil diperbarui.', user: updatedUser });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Gagal memperbarui profil.', error: error.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
        const { User, Order, Deposit, Product, Voucher, Review } = req.db.models;
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Password lama dan baru wajib diisi.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
        }

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password lama tidak sesuai.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await user.update({ password: hashedPassword });

        res.json({ message: 'Password berhasil diubah.' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Gagal mengubah password.', error: error.message });
    }
};

// Get my orders (transaction history)
exports.getMyOrders = async (req, res) => {
        const { User, Order, Deposit, Product, Voucher, Review } = req.db.models;
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            attributes: [
                'id', 'invoice_number', 'customer_id', 'zone_id', 'customer_name',
                'price', 'total_amount', 'fee', 'payment_status', 'order_status', 'created_at',
                'product_id', 'points_earned', 'points_used', 'promo_discount'
            ],
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'sku'],
                    include: [{ model: Voucher, attributes: ['name', 'thumbnail'] }]
                },
                {
                    model: Review,
                    attributes: ['id', 'rating']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 50
        });
        res.json({ orders });
    } catch (error) {
        console.error('Get My Orders Error:', error);
        res.status(500).json({ message: 'Gagal mengambil riwayat transaksi.', error: error.message });
    }
};

// Create deposit via Prismalink (Otomatis)
exports.createPrismalinkDeposit = async (req, res) => {
        const { User, Order, Deposit, Product, Voucher, Review } = req.db.models;
    try {
        const { amount, method } = req.body; // method = channel code e.g. '014', 'QRIS'
        const userId = req.user.id;

        if (!amount || amount < 10000) {
            return res.status(400).json({ message: 'Nominal minimal Rp 10.000.' });
        }
        if (!method) {
            return res.status(400).json({ message: 'Pilih metode pembayaran terlebih dahulu.' });
        }

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

        // Buat merchant ref unik
        const merchantRef = `DEP-${userId}-${Date.now()}`;

        // Buat Prismalink transaction
        const plResult = await prismalinkService.createClosedPayment({
            merchant_ref: merchantRef,
            amount: parseInt(amount),
            method,
            customer_name: user.name,
            customer_email: user.email || 'user@samstore.id',
            customer_phone: user.whatsapp || '081234567890',
            sku: `DEPOSIT-${userId}`,
            product_name: 'Topup Saldo SamStore',
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?tab=topup`
        });

        if (!plResult.success) {
            return res.status(500).json({ message: 'Gagal membuat transaksi Prismalink.' });
        }

        // Simpan record deposit ke DB (status Pending, dikonfirmasi via webhook)
        await Deposit.create({
            userId,
            amount: parseInt(amount),
            payment_method: `Prismalink-${method}`,
            status: 'Pending',
            note: `ref:${merchantRef}`
        });

        res.json({
            message: 'Transaksi berhasil dibuat.',
            checkout_url: plResult.data.checkout_url,
            merchant_ref: merchantRef
        });
    } catch (error) {
        console.error('Create Prismalink Deposit Error:', error);
        res.status(500).json({ message: 'Gagal membuat deposit otomatis.', error: error.message });
    }
};

// Create deposit manual (konfirmasi ke admin)
exports.createManualDeposit = async (req, res) => {
        const { User, Order, Deposit, Product, Voucher, Review } = req.db.models;
    try {
        const { amount, bank_name, account_number } = req.body;
        const userId = req.user.id;

        if (!amount || amount < 10000) {
            return res.status(400).json({ message: 'Nominal minimal Rp 10.000.' });
        }

        const note = bank_name
            ? `Transfer ke ${bank_name} (${account_number || '-'})`
            : 'Transfer Manual';

        await Deposit.create({
            userId,
            amount: parseInt(amount),
            payment_method: 'Manual Transfer',
            status: 'Pending',
            note
        });

        res.json({
            message: `Permintaan deposit Rp ${parseInt(amount).toLocaleString('id-ID')} berhasil dicatat. Segera transfer dan konfirmasi ke admin via WhatsApp.`
        });
    } catch (error) {
        console.error('Create Manual Deposit Error:', error);
        res.status(500).json({ message: 'Gagal membuat deposit manual.', error: error.message });
    }
};

