const { Promo } = require('../models');
const { Op } = require('sequelize');

exports.getAllPromos = async (req, res) => {
    try {
        const promos = await Promo.findAll({ order: [['created_at', 'DESC']] });
        res.json(promos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPromo = async (req, res) => {
    try {
        const promo = await Promo.create(req.body);
        res.status(201).json(promo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePromo = async (req, res) => {
    try {
        const promo = await Promo.findByPk(req.params.id);
        if (!promo) return res.status(404).json({ message: 'Promo tidak ditemukan' });
        await promo.update(req.body);
        res.json(promo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deletePromo = async (req, res) => {
    try {
        const promo = await Promo.findByPk(req.params.id);
        if (!promo) return res.status(404).json({ message: 'Promo tidak ditemukan' });
        await promo.destroy();
        res.json({ message: 'Promo dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getActivePromos = async (req, res) => {
    try {
        const now = new Date();
        const promos = await Promo.findAll({
            where: {
                is_active: true,
                start_date: { [Op.lte]: now },
                end_date: { [Op.gte]: now }
            }
        });
        res.json(promos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
