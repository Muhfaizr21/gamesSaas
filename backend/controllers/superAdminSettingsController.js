const PlatformSetting = require('../master_models/PlatformSetting');
const SaaSPlan = require('../master_models/SaaSPlan');
const DomainRequest = require('../master_models/DomainRequest');
const BroadcastMessage = require('../master_models/BroadcastMessage');
const ProviderLog = require('../master_models/ProviderLog');

module.exports = {
    // ─── PLATFORM SETTINGS ────────────────────────────────────────────────────
    getSettings: async (req, res) => {
        try {
            const { group } = req.query;
            const whereClause = group ? { group } : {};
            const settings = await PlatformSetting.findAll({ where: whereClause });
            res.json(settings);
        } catch (err) {
            res.status(500).json({ message: 'Gagal ambil settings', error: err.message });
        }
    },

    updateSetting: async (req, res) => {
        try {
            const { key } = req.params;
            const { value } = req.body;
            let setting = await PlatformSetting.findOne({ where: { key } });
            if (!setting) {
                return res.status(404).json({ message: 'Setting tidak ditemukan' });
            }
            setting.value = value;
            await setting.save();
            res.json({ message: 'Berhasil update setting', setting });
        } catch (err) {
            res.status(500).json({ message: 'Gagal update setting', error: err.message });
        }
    },

    // ─── SAAS PLANS ───────────────────────────────────────────────────────────
    getPlans: async (req, res) => {
        try {
            const plans = await SaaSPlan.findAll();
            // Parse JSON features for each plan
            const parsedPlans = plans.map(p => {
                const pd = p.toJSON();
                try { pd.features = JSON.parse(pd.features); } catch (e) { }
                return pd;
            });
            res.json(parsedPlans);
        } catch (err) {
            res.status(500).json({ message: 'Gagal ambil plans', error: err.message });
        }
    },

    createPlan: async (req, res) => {
        try {
            const { name, price, durationDays, features, badge, originalPrice, description } = req.body;
            const plan = await SaaSPlan.create({
                name, price, durationDays, badge, originalPrice, description, features: JSON.stringify(features || [])
            });
            res.status(201).json({ message: 'Plan dibuat', plan });
        } catch (err) {
            res.status(500).json({ message: 'Gagal buat plan', error: err.message });
        }
    },

    updatePlan: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, price, durationDays, features, isActive, badge, originalPrice, description } = req.body;
            const plan = await SaaSPlan.findByPk(id);
            if (!plan) return res.status(404).json({ message: 'Plan tidak ditemukan' });

            if (name) plan.name = name;
            if (price !== undefined) plan.price = price;
            if (originalPrice !== undefined) plan.originalPrice = originalPrice;
            if (badge !== undefined) plan.badge = badge;
            if (description !== undefined) plan.description = description;
            if (durationDays) plan.durationDays = durationDays;
            if (features) plan.features = JSON.stringify(features);
            if (typeof isActive !== 'undefined') plan.isActive = isActive;

            await plan.save();
            const pd = plan.toJSON();
            try { pd.features = JSON.parse(pd.features); } catch (e) { }
            res.json({ message: 'Plan diupdate', plan: pd });
        } catch (err) {
            res.status(500).json({ message: 'Gagal update plan', error: err.message });
        }
    },

    deletePlan: async (req, res) => {
        try {
            const { id } = req.params;
            const plan = await SaaSPlan.findByPk(id);
            if (!plan) return res.status(404).json({ message: 'Plan tidak ditemukan' });
            await plan.destroy();
            res.json({ message: `Plan '${plan.name}' berhasil dihapus.` });
        } catch (err) {
            res.status(500).json({ message: 'Gagal hapus plan', error: err.message });
        }
    },

    // ─── DOMAIN REQUESTS ──────────────────────────────────────────────────────
    getDomainRequests: async (req, res) => {
        try {
            const requests = await DomainRequest.findAll({ order: [['createdAt', 'DESC']] });
            res.json(requests);
        } catch (err) {
            res.status(500).json({ message: 'Gagal ambil domain requests', error: err.message });
        }
    },

    updateDomainRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, providerRecords, notes } = req.body;
            const request = await DomainRequest.findByPk(id);
            if (!request) return res.status(404).json({ message: 'Request tidak ditemukan' });

            request.status = status;
            if (providerRecords) request.providerRecords = providerRecords;
            if (notes) request.notes = notes;
            await request.save();
            res.json({ message: 'Domain request diupdate', request });
        } catch (err) {
            res.status(500).json({ message: 'Gagal update domain request', error: err.message });
        }
    },

    // ─── BROADCAST MESSAGES ───────────────────────────────────────────────────
    getBroadcasts: async (req, res) => {
        try {
            const broadcasts = await BroadcastMessage.findAll({ order: [['createdAt', 'DESC']] });
            res.json(broadcasts);
        } catch (err) {
            res.status(500).json({ message: 'Gagal ambil broadcasts', error: err.message });
        }
    },

    createBroadcast: async (req, res) => {
        try {
            const { title, message, level, targetAudience, targetTenantId, expiresAt } = req.body;
            const broadcast = await BroadcastMessage.create({
                title, message, level, targetAudience, targetTenantId, expiresAt
            });
            res.status(201).json({ message: 'Broadcast dibuat', broadcast });
        } catch (err) {
            res.status(500).json({ message: 'Gagal buat broadcast', error: err.message });
        }
    },

    // ─── PROVIDER LOGS ────────────────────────────────────────────────────────
    getProviderLogs: async (req, res) => {
        try {
            const logs = await ProviderLog.findAll({
                order: [['createdAt', 'DESC']],
                limit: 100 // limit to last 100 for performance
            });
            res.json(logs);
        } catch (err) {
            res.status(500).json({ message: 'Gagal ambil logs', error: err.message });
        }
    }
};
