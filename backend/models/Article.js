module.exports = (sequelize, DataTypes) => {
    const Article = sequelize.define('Article', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        excerpt: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Ringkasan singkat artikel untuk preview & SEO',
        },
        thumbnail: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Kategori artikel: Tips, News, Promo, Panduan',
        },
        tags: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Comma-separated tags untuk SEO',
        },
        // --- SEO Fields ---
        meta_title: {
            type: DataTypes.STRING(70),
            allowNull: true,
        },
        meta_description: {
            type: DataTypes.STRING(160),
            allowNull: true,
        },
        meta_keywords: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        canonical_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        og_title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        og_description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        og_image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // --- Publishing ---
        status: {
            type: DataTypes.ENUM('draft', 'published', 'archived'),
            defaultValue: 'draft',
        },
        published_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        timestamps: true,
        indexes: [
            { fields: ['status'] },              // Filter published articles
            { fields: ['author_id'] },           // Articles by author
            { fields: ['status', 'created_at'] }, // Published articles sorted by date
            { fields: ['category'] },            // Filter by category
        ]
    });

    Article.associate = (models) => {
        // Associations
        models.Article.belongsTo(models.User, { foreignKey: 'authorId', as: 'Author' });
        models.User.hasMany(models.Article, { foreignKey: 'authorId' });
    };

    return Article;
};
