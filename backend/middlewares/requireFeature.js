const requireFeature = (featureName) => {
    return (req, res, next) => {
        // Asumsikan req.tenantFeatures diset oleh tenantMiddleware
        if (!req.tenantFeatures || !Array.isArray(req.tenantFeatures)) {
            return res.status(403).json({
                message: `Akses Ditolak. Harus memiliki paket yang mendukung fitur: ${featureName}`
            });
        }

        // Contoh: Cek array ["Fitur Flash Sale", "Cek Transaksi"]
        // Lakukan perbandingan secara case-insensitive
        const hasFeature = req.tenantFeatures.some(f => f.toLowerCase() === featureName.toLowerCase());

        if (hasFeature) {
            next();
        } else {
            return res.status(403).json({
                message: `Fitur "${featureName}" tidak tersedia pada paket (${req.tenant?.plan?.name || 'Saat Ini'}). Silakan upgrade paket Anda untuk menggunakan fitur ini.`
            });
        }
    };
};

module.exports = requireFeature;
