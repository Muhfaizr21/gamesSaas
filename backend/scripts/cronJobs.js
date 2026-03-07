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

                // TODO: Kirim notifikasi WA ke nomor admin reseller jika ada.
                // Karena struktur table Tenant kita belum punya adminWhatsapp di level Master, kita harus nge-hook ke DB tenant-nya, atau simpan admin WA di Tenant model master.
                // Untuk MVP, console log cukup:
            }

        } catch (error) {
            console.error('[CRON] Error saat mengecek tenant expired:', error);
        }
    });

    console.log('[CRON] Task terjadwal diinisialisasi.');
}

module.exports = { initCronJobs };
