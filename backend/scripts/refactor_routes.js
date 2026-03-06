const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../routes');

const allModels = 'User, Category, Voucher, Product, Order, Deposit, Article, Setting, BankAccount, Review, Promo, PromoCode, SpinPrize, SavingPot, SavingTransaction';

fs.readdirSync(dir).forEach(file => {
    if (!file.endsWith('.js')) return;
    const filePath = path.join(dir, file);
    let code = fs.readFileSync(filePath, 'utf8');

    // Remove old model imports
    code = code.replace(/const\s+\{([^}]+)\}\s*=\s*require\('\.\.?\/models'\);\r?\n/g, '');
    code = code.replace(/const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*require\('\.\.?\/models\/[A-Z][a-zA-Z0-9_]*'\);\r?\n/g, '');

    // Inject into routes
    const funcRegex = /(\(\s*req\s*,\s*res(?:\s*,\s*next)?\s*\)\s*(?:=>\s*)?\{)/g;

    code = code.replace(funcRegex, (fullMatch) => {
        return `${fullMatch}\n        const { ${allModels} } = req.db.models;`;
    });

    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Fixed routes:', file);
});
