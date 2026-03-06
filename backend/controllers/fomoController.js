const { Product, Order } = require('../models');

// Kumpulan nama fiktif untuk Gimmick FOMO
const fomoNames = [
    'Budi', 'Andi', 'Rizky', 'Putra', 'Dimas', 'Agus', 'Fajar', 'Siti', 'Ayu', 'Rina',
    'Dika', 'Reza', 'Kevin', 'Iqbal', 'Hendra', 'Yusuf', 'Arif', 'Tegar', 'Ilham', 'Joko',
    'Gaming', 'Pro', 'Noob', 'Sultan', 'Tzy', 'Gamer'
];

exports.getFomoData = async (req, res) => {
    try {
        // Ambil beberapa produk secara random untuk bahan fomo
        const products = await Product.findAll({
            where: { isActive: true },
            order: sequelize.random(),
            limit: 5
        });

        if (products.length === 0) {
            return res.json([]);
        }

        // Generate 5-10 fake notifications
        const fomoList = [];
        const count = Math.floor(Math.random() * 5) + 5; // 5 to 9 items

        for (let i = 0; i < count; i++) {
            const randomName = fomoNames[Math.floor(Math.random() * fomoNames.length)] + '***';
            const randomProduct = products[Math.floor(Math.random() * products.length)];

            // Random time ago (e.g., 1 to 59 minutes ago)
            const minutesAgo = Math.floor(Math.random() * 59) + 1;

            fomoList.push({
                id: `fomo-${Date.now()}-${i}`,
                name: randomName,
                product: randomProduct.name,
                time: `${minutesAgo} Menit lalu`,
                type: 'fake' // Cuma penanda internal
            });
        }

        // Ambil 2 Order Success beneran terbaru dari DB jika ada
        const recentOrders = await Order.findAll({
            where: { order_status: 'Success' },
            order: [['updated_at', 'DESC']],
            limit: 2
        });

        for (const order of recentOrders) {
            const product = await Product.findByPk(order.productId);
            if (product) {
                // Sensor nama customer asli
                let safeName = order.customer_name || 'Gamer';
                if (safeName.length > 3) safeName = safeName.substring(0, 3) + '***';

                fomoList.unshift({
                    id: `real-${order.id}`,
                    name: safeName,
                    product: product.name,
                    time: 'Baru saja',
                    type: 'real'
                });
            }
        }

        res.json(fomoList);
    } catch (error) {
        console.error("FOMO Error:", error);
        res.status(500).json({ message: 'Error generating fomo data' });
    }
};
