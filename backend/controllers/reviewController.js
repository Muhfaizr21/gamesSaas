const { Review, User, Product, Order } = require('../models');
const { Op } = require('sequelize');

exports.createReview = async (req, res) => {
    try {
        const { orderId, productId, rating, comment } = req.body;
        const userId = req.user.id;

        const existing = await Review.findOne({ where: { orderId: orderId } });
        if (existing) {
            return res.status(400).json({ message: 'Pesanan ini sudah diberi ulasan' });
        }

        const review = await Review.create({
            userId, orderId, productId, rating, comment, is_visible: true
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPublicReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { is_visible: true, rating: { [Op.gte]: 4 } }, // Only show 4-5 stars online
            include: [
                { model: User, as: 'User', attributes: ['name'] },
                { model: Product, as: 'Product', attributes: ['name'] }
            ],
            order: [['created_at', 'DESC']],
            limit: 15
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, as: 'User', attributes: ['name', 'email'] },
                { model: Product, as: 'Product', attributes: ['name'] },
                { model: Order, as: 'Order', attributes: ['invoice_number'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleVisibility = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        await review.update({ is_visible: !review.is_visible });
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        await review.destroy();
        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
