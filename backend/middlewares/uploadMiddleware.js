const multer = require('multer');
const path = require('path');

// Menggunakan memory storage agar buffer bisa diolah oleh 'sharp' sebelum disimpan ke disk
const storage = multer.memoryStorage();

// Filter file as image
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Bukan file gambar! Silakan upload file gambar.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // Batas maksimal 2MB
    },
    fileFilter: fileFilter
});

module.exports = upload;
