require('dotenv').config({ path: './.env' });
const Tenant = require('./master_models/Tenant');
const TenantConfig = require('./master_models/TenantConfig');
const SaaSPlan = require('./master_models/SaaSPlan');
const masterSequelize = require('./config/masterDatabase');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

async function createDemo() {
    console.log("--- Creating Demo Reseller ---");

    // Data dummy
    const data = {
        storeName: 'SamStore Demo',
        subdomain: 'demo',
        ownerName: 'Demo Reseller',
        email: 'demo@reseller.com',
        whatsapp: '08123456789',
        password: 'password123',
    };

    const cleanSubdomain = data.subdomain.toLowerCase();
    const dbName = `tenant_${cleanSubdomain}`;

    try {
        // Find first active plan
        const plan = await SaaSPlan.findOne({ where: { isActive: true } });
        if (!plan) {
            console.error("No active plan found. Please create a plan first in Admin Panel.");
            return;
        }

        console.log(`Using Plan: ${plan.name} (ID: ${plan.id})`);

        // Check if exists
        const existing = await Tenant.findOne({ where: { subdomain: cleanSubdomain } });
        if (existing) {
            console.log("Tenant 'demo' already exists. Deleting legacy data...");
            await masterSequelize.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
            await TenantConfig.destroy({ where: { tenantId: existing.id } });
            await existing.destroy();
        }

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + (plan.durationDays || 30));

        // Create Tenant
        const newTenant = await Tenant.create({
            name: data.storeName,
            subdomain: cleanSubdomain,
            dbName: dbName,
            adminName: data.ownerName,
            adminEmail: data.email,
            adminWhatsapp: data.whatsapp,
            status: 'active',
            planId: plan.id,
            subscriptionExpiresAt: expirationDate,
            balance: 1000000 // Beri saldo awal 1jt buat ngetest
        });

        // Create Config
        await TenantConfig.create({
            tenantId: newTenant.id,
            digiflazzUsername: '',
            digiflazzKey: '',
            markupPercent: 5
        });

        console.log(`Creating database: ${dbName}...`);
        await masterSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

        const tenantSequelize = new Sequelize(
            dbName,
            process.env.DB_USER || 'root',
            process.env.DB_PASS || 'root',
            {
                host: process.env.DB_HOST || '127.0.0.1',
                port: process.env.DB_PORT || 8889,
                dialect: 'mysql',
                logging: false,
                define: { underscored: true, timestamps: true }
            }
        );

        const models = require('./models/initTenantModels')(tenantSequelize);
        await tenantSequelize.sync({ force: true });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        await models.User.create({
            name: data.ownerName,
            email: data.email,
            whatsapp: data.whatsapp,
            password: hashedPassword,
            role: 'admin'
        });

        console.log("\n✅ SUCCESS!");
        console.log("-----------------------------------------");
        console.log("Reseller Login Details:");
        console.log(`URL: http://${cleanSubdomain}.localhost:3000/admin-reseller`);
        console.log(`Email: ${data.email}`);
        console.log(`Password: ${data.password}`);
        console.log("-----------------------------------------");

        await tenantSequelize.close();
        process.exit(0);
    } catch (err) {
        console.error("ERROR:", err);
        process.exit(1);
    }
}

createDemo();
