const masterSequelize = require('../config/masterDatabase');
const SaaSPlan = require('../master_models/SaaSPlan');

async function seed() {
    console.log('--- Memulai Seeding SaaS Plans berdasarkan referensi desain ---');

    // Auth & sync
    await masterSequelize.authenticate();
    // Memaksa alter tabel jika kita baru menambahkan field description, badge, originalPrice
    await masterSequelize.sync({ alter: true });

    // Kosongkan plan yang ada
    await SaaSPlan.destroy({ where: {} });
    console.log('Data lama dibersihkan.');

    const plans = [
        {
            name: 'Pro',
            price: 74917,
            originalPrice: 2247500,
            durationDays: 30,
            badge: 'MULAI LANGSUNG CUAN',
            description: 'Mulai bisnis dengan mudah!',
            isActive: true,
            features: JSON.stringify([
                'Potensi Profit Hingga Rp5jt/bln',
                'Akses Semua Produk',
                'Harga Modal Murah',
                'Tanpa Deposit',
                'BONUS Domain (2 Pilihan)',
                'Website Fast',
                'Kustomisasi Website',
                'Optimasi SEO & Pixel',
                'Manajemen Kupon Diskon',
                'x Advanced Web Templates',
                'QRIS Payment Fee (2.5%)',
                'VA Payment Fee (Rp5.250,-)',
                'Modern Store Fee (Rp5.250,-)',
                'x Variasi Template Website',
                'x Cek Transaksi',
                'x Payment Channel Management',
                'Hanya .my.id & .biz.id',
                'x Reseller Academy',
                'x Fitur Flash Sale',
                'x Penarikan Saldo Instan',
                'x Kustomisasi Detail Produk',
                'x Build Your APK'
            ])
        },
        {
            name: 'Legend',
            price: 82250,
            originalPrice: 2497500,
            durationDays: 30,
            badge: 'UNTUNG MAKIN BERLIPAT',
            description: 'Naik level, untung berlipat!',
            isActive: true,
            features: JSON.stringify([
                'Potensi Profit Hingga Rp15jt/bln',
                'Akses Semua Produk',
                'Harga Modal Lebih Murah',
                'Tanpa Deposit',
                'BONUS Domain (2 Pilihan)',
                'Website Faster',
                'Kustomisasi Website',
                'Optimasi SEO & Pixel',
                'Manajemen Kupon Diskon',
                'Advanced Web Templates',
                'QRIS Payment Fee (2%)',
                'VA Payment Fee (Rp5.000,-)',
                'Modern Store Fee (Rp5.000,-)',
                'Variasi Template Website',
                'Cek Transaksi',
                'Payment Channel Management',
                'Hanya .my.id & .biz.id',
                'x Reseller Academy',
                'x Fitur Flash Sale',
                'x Penarikan Saldo Instan',
                'x Kustomisasi Detail Produk',
                'x Build Your APK'
            ])
        },
        {
            name: 'Supreme',
            price: 99917,
            originalPrice: 2997500,
            durationDays: 30,
            badge: 'PALING BANJIR CUAN',
            description: 'Fitur terlengkap, untung terbesar!',
            isActive: true,
            features: JSON.stringify([
                'Potensi Profit Hingga Rp30jt/bln',
                'Akses Semua Produk',
                'Harga Modal Paling Murah',
                'Tanpa Deposit',
                'BONUS Domain (12 Pilihan)',
                'Website Super Fast',
                'Kustomisasi Website',
                'Optimasi SEO & Pixel',
                'Manajemen Kupon Diskon',
                'Advanced Web Templates',
                'QRIS Payment Fee (1%)',
                'VA Payment Fee (Rp4.500,-)',
                'Modern Store Fee (Rp4.500,-)',
                'Variasi Template Website',
                'Cek Transaksi',
                'Payment Channel Management',
                'Dapat Domain TLD',
                'Reseller Academy',
                'Fitur Flash Sale',
                'Penarikan Saldo Instan',
                'Kustomisasi Detail Produk',
                'Build Your APK'
            ])
        }
    ];

    await SaaSPlan.bulkCreate(plans);
    console.log(`Berhasil membuat ${plans.length} plans.`);
    process.exit(0);
}

seed().catch(err => {
    console.error('Gagal:', err.message);
    process.exit(1);
});
