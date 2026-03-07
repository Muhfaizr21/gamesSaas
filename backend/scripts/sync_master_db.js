require('dotenv').config();
const masterSequelize = require('../config/masterDatabase');
const Tenant = require('../master_models/Tenant');
const TenantConfig = require('../master_models/TenantConfig');
const PlatformSetting = require('../master_models/PlatformSetting');
const DomainRequest = require('../master_models/DomainRequest');
const ProviderLog = require('../master_models/ProviderLog');
const SaaSPlan = require('../master_models/SaaSPlan');
const BroadcastMessage = require('../master_models/BroadcastMessage');

const syncMasterDB = async () => {
    try {
        await masterSequelize.authenticate();
        console.log('Connected to master database.');

        // Establish remaining relations if not already defined in models
        // DomainRequest belongsTo Tenant is already in DomainRequest.js

        // Sync all models to master DB
        await masterSequelize.sync({ alter: true });
        console.log('Master database synced successfully.');

        // Insert some default seed data for SaaSPlans
        const starterPlanCount = await SaaSPlan.count();
        if (starterPlanCount === 0) {
            await SaaSPlan.bulkCreate([
                { name: 'Starter', price: 50000, durationDays: 30, features: JSON.stringify(['subdomain', 'basic_support']) },
                { name: 'Pro', price: 150000, durationDays: 30, features: JSON.stringify(['subdomain', 'custom_domain', 'spin_wheel', 'priority_support']) }
            ]);
            console.log('Seeded default SaaS Plans.');
        }

        const platformSettingsCount = await PlatformSetting.count();
        if (platformSettingsCount === 0) {
            await PlatformSetting.bulkCreate([
                { key: 'DIGIFLAZZ_USERNAME', value: process.env.DIGIFLAZZ_USERNAME || '', group: 'API_PROVIDER' },
                { key: 'DIGIFLAZZ_KEY', value: process.env.DIGIFLAZZ_KEY || '', group: 'API_PROVIDER' },
                { key: 'PRISMALINK_MERCHANT', value: process.env.PRISMA_MERCHANT_CODE || '', group: 'PAYMENT_GATEWAY' },
                { key: 'PRISMALINK_KEY', value: process.env.PRISMA_SECRET_KEY || '', group: 'PAYMENT_GATEWAY' },
                { key: 'TRIPAY_API_KEY', value: '', group: 'PAYMENT_GATEWAY' },
                { key: 'TRIPAY_PRIVATE_KEY', value: '', group: 'PAYMENT_GATEWAY' },
                { key: 'TRIPAY_MERCHANT_CODE', value: '', group: 'PAYMENT_GATEWAY' },
                { key: 'GLOBAL_MARKUP_PERCENT', value: '5', group: 'MARKUP', description: 'Tambahan margin 5% dari harga supplier' },
                { key: 'GLOBAL_MARKUP_FIXED', value: '500', group: 'MARKUP', description: 'Tambahan margin fix Rp 500' },
            ]);
            console.log('Seeded default Platform Settings.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error syncing master db:', error);
        process.exit(1);
    }
};

syncMasterDB();
