const cron = require('node-cron');
const { Op } = require('sequelize');
const Tenant = require('../master_models/Tenant');
const whatsappService = require('../services/whatsappService');

function initCronJobs() {
    // Jalankan setiap jam 00:00 (Tengah malam)
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('[CRON] Menjalankan pengecekan Tenant yang expired...');
            const now = new Date();

            // Cari tenant active yang subscriptionExpiresAt nya sudah lewat
            const expiredTenants = await Tenant.findAll({
                where: {
                    status: 'active',
                    subscriptionExpiresAt: {
                        [Op.lt]: now
                    }
                }
            });

            if (expiredTenants.length === 0) {
                console.log('[CRON] Tidak ada tenant yang expired hari ini.');
                return;
            }

            for (const tenant of expiredTenants) {
                tenant.status = 'suspended';
                await tenant.save();
                console.log(`[CRON] Tenant ${tenant.subdomain} telah di-suspend karena masa aktif berakhir.`);

                if (tenant.adminWhatsapp) {
                    const message = `PEMBERITAHUAN PENTING 🚨\n\nHalo Admin Toko *${tenant.name}*,\n\nMasa aktif paket langganan toko Anda telah *berakhir*. Saat ini toko Anda telah *dinonaktifkan sementara* (suspended).\n\nSilakan hubungi Super Admin untuk memperpanjang langganan dan mengaktifkan kembali toko Anda.\n\nTerima kasih,\nTim SAMSaaS`;
                    whatsappService.sendMessage(tenant.adminWhatsapp, message);
                }
            }

        } catch (error) {
            console.error('[CRON] Error saat mengecek tenant expired:', error);
        }
    });

    console.log('[CRON] Task terjadwal diinisialisasi.');
}

module.exports = { initCronJobs };
