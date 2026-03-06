const { Article, User } = require('../models');
const { Op } = require('sequelize');

// Helper: generate slug from title
function generateSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// ==================== WRITER ENDPOINTS ====================

exports.getMyArticles = async (req, res) => {
    try {
        const articles = await Article.findAll({
            where: { authorId: req.user.id },
            order: [['created_at', 'DESC']]
        });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil artikel', error: error.message });
    }
};

exports.createArticle = async (req, res) => {
    try {
        const { title, content, excerpt, thumbnail, category, tags,
            meta_title, meta_description, meta_keywords,
            canonical_url, og_title, og_description, og_image, status } = req.body;

        const slug = generateSlug(title) + '-' + Date.now();

        const article = await Article.create({
            title, slug, content, excerpt, thumbnail, category, tags,
            meta_title: meta_title || title.substring(0, 70),
            meta_description: meta_description || (excerpt || '').substring(0, 160),
            meta_keywords, canonical_url, og_title, og_description, og_image,
            status: status || 'draft',
            published_at: status === 'published' ? new Date() : null,
            authorId: req.user.id
        });

        res.status(201).json({ success: true, article });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat artikel', error: error.message });
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const article = await Article.findOne({ where: { id: req.params.id, authorId: req.user.id } });
        if (!article) return res.status(404).json({ message: 'Artikel tidak ditemukan' });

        const data = req.body;
        // Auto-set published_at if transitioning to published
        if (data.status === 'published' && article.status !== 'published') {
            data.published_at = new Date();
        }
        // Re-generate slug if title changed
        if (data.title && data.title !== article.title) {
            data.slug = generateSlug(data.title) + '-' + Date.now();
        }

        await article.update(data);
        res.json({ success: true, article });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui artikel', error: error.message });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findOne({ where: { id: req.params.id, authorId: req.user.id } });
        if (!article) return res.status(404).json({ message: 'Artikel tidak ditemukan' });

        await article.destroy();
        res.json({ success: true, message: 'Artikel berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus artikel', error: error.message });
    }
};

// ==================== PUBLIC ENDPOINTS ====================

exports.getPublishedArticles = async (req, res) => {
    try {
        const articles = await Article.findAll({
            where: { status: 'published' },
            include: [{ model: User, as: 'Author', attributes: ['id', 'name'] }],
            order: [['published_at', 'DESC']],
            attributes: { exclude: ['content'] } // Don't send full content in list
        });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil artikel', error: error.message });
    }
};

exports.getArticleBySlug = async (req, res) => {
    try {
        const article = await Article.findOne({
            where: { slug: req.params.slug, status: 'published' },
            include: [{ model: User, as: 'Author', attributes: ['id', 'name'] }]
        });
        if (!article) return res.status(404).json({ message: 'Artikel tidak ditemukan' });

        // Increment views
        await article.increment('views');

        res.json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

// --- Sitemap Data (Vouchers & Articles) ---
exports.getSitemapData = async (req, res) => {
    try {
        const { Voucher } = require('../models');

        // Fetch active vouchers (games)
        const vouchers = await Voucher.findAll({
            where: { isActive: true },
            attributes: ['slug', 'updatedAt']
        });

        // Fetch published articles
        const articles = await Article.findAll({
            where: { status: 'published' },
            attributes: ['slug', 'updatedAt']
        });

        res.json({
            vouchers: vouchers.map(v => ({ slug: v.slug, lastmod: v.updatedAt })),
            articles: articles.map(a => ({ slug: a.slug, lastmod: a.updatedAt }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sitemap data', error: error.message });
    }
};
