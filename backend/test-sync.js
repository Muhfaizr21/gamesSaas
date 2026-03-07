const { syncDigiflazzProducts } = require('./controllers/adminController');
const Tenant = require('./master_models/Tenant');
const TenantConfig = require('./master_models/TenantConfig');
const { getTenantConnection } = require('./services/dbPoolManager');

async function test() {
    const t = await Tenant.findOne({ where: { subdomain: 'budi' }, include: [TenantConfig]});
    const db = await getTenantConnection(t);
    const mockReq = {
        tenantConfig: t.TenantConfig,
        db: db
    };
    const mockRes = {
        json: (data) => console.log('Response:', data),
        status: (code) => ({ json: (data) => console.log('Status', code, data) })
    };
    await syncDigiflazzProducts(mockReq, mockRes);
}
test().catch(console.error);
