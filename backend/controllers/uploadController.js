const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

exports.uploadVoucherThumbnail = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
        }

        // Generate nama file unik dengan timestamp, format akhir .webp
        const filename = `voucher-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        // Path absolut ke folder public/uploads/vouchers
        const uploadPath = path.join(__dirname, '../public/uploads/vouchers', filename);

        // Pastikan direktori ada (meskipun sebelumnya udah dibuat via script)
        const dir = path.dirname(uploadPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Proses konversi gambar ke webp menggunakan sharp
        await sharp(req.file.buffer)
            .trim()
            .resize(300, 300, { // Full square fill
                fit: sharp.fit.cover,
                position: sharp.position.center,
                withoutEnlargement: true
            })
            .sharpen()
            .webp({ quality: 90 })
            .toFile(uploadPath);

        // Kirim response berupa nama file (atau URL relatif) agar bisa disimpan frontend ke kolom thumbnail database
        res.json({
            message: 'Gambar berhasil diunggah',
            fileUrl: `/uploads/vouchers/${filename}` // Return format yg siap dipanggil frontent (http://host/uploads/vouchers/...)
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'Gagal memproses gambar', error: error.message });
    }
};

exports.uploadPromoBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
        }

        const filename = `promo-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        const uploadPath = path.join(__dirname, '../public/uploads/promos', filename);

        const dir = path.dirname(uploadPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        await sharp(req.file.buffer)
            .trim()
            .resize(800, 400, { // Asumsi banner promo persegi panjang
                fit: sharp.fit.cover,
                position: sharp.position.center,
                withoutEnlargement: true
            })
            .sharpen()
            .webp({ quality: 90 })
            .toFile(uploadPath);

        res.json({
            message: 'Banner promo berhasil diunggah',
            fileUrl: `/uploads/promos/${filename}`
        });
    } catch (error) {
        console.error("Upload Promo Error:", error);
        res.status(500).json({ message: 'Gagal memproses gambar promo', error: error.message });
    }
};

exports.uploadArticleThumbnail = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
        }

        const filename = `article-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        const uploadPath = path.join(__dirname, '../public/uploads/articles', filename);

        const dir = path.dirname(uploadPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        await sharp(req.file.buffer)
            .trim()
            .resize(800, 600, { // Thumbnail artikel
                fit: sharp.fit.cover,
                position: sharp.position.center,
                withoutEnlargement: true
            })
            .sharpen()
            .webp({ quality: 90 })
            .toFile(uploadPath);

        res.json({
            message: 'Thumbnail artikel berhasil diunggah',
            fileUrl: `/uploads/articles/${filename}`
        });
    } catch (error) {
        console.error("Upload Article Error:", error);
        res.status(500).json({ message: 'Gagal memproses gambar artikel', error: error.message });
    }
};

exports.uploadProductImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
        }

        const filename = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        const uploadPath = path.join(__dirname, '../public/uploads/products', filename);

        const dir = path.dirname(uploadPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        await sharp(req.file.buffer)
            .trim()
            .resize(200, 200, {
                fit: sharp.fit.cover,
                position: sharp.position.center,
                withoutEnlargement: true
            })
            .sharpen()
            .webp({ quality: 90 })
            .toFile(uploadPath);

        res.json({
            message: 'Gambar produk berhasil diunggah',
            fileUrl: `/uploads/products/${filename}`
        });
    } catch (error) {
        console.error("Upload Product Error:", error);
        res.status(500).json({ message: 'Gagal memproses gambar produk', error: error.message });
    }
};
