const Tenant = require('../master_models/Tenant');
const TenantDepositRequest = require('../master_models/TenantDepositRequest');

Promise.all([
    Tenant.sync({ alter: true }),
    TenantDepositRequest.sync({ alter: true })
])
    .then(() => {
        console.log("Tenant tables (with deposit requests) altered/synced successfully with new columns.");
        process.exit();
    })
    .catch((err) => {
        console.error("Failed to alter Tenant tables:", err);
        process.exit(1);
    });
