const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && !['index.js', 'initTenantModels.js'].includes(f));

const modelNames = [
    'User', 'Category', 'Voucher', 'Product', 'Order', 'Deposit', 'Article', 'Setting',
    'BankAccount', 'Review', 'Promo', 'PromoCode', 'SpinPrize', 'SavingPot', 'SavingTransaction'
];

files.forEach(file => {
    const filePath = path.join(modelsDir, file);
    let code = fs.readFileSync(filePath, 'utf8');

    // Hapus require yang lama
    code = code.replace(/const\s+\{\s*DataTypes\s*\}\s*=\s*require\('sequelize'\);\r?\n/g, '');
    code = code.replace(/const\s+sequelize\s*=\s*require\('\.\.\/config\/database'\);\r?\n/g, '');
    // Hapus require model lain (e.g. const Category = require('./Category');)
    code = code.replace(/const\s+[A-Za-z0-9_]+\s*=\s*require\('\.\/[A-Za-z0-9_]+'\);\r?\n/g, '');

    // Cari tahu nama model utama di file ini
    const match = code.match(/const\s+([A-Za-z0-9_]+)\s*=\s*sequelize\.define/);
    if (!match) {
        console.log(`- Melewati ${file} (Bukan definisi model standar)`);
        return;
    }
    const modelName = match[1];

    // Pisahkan kode sebelum // Associations dengan sesudahnya
    let mainDef = code;
    let assocPart = '';
    const assocIndex = code.indexOf('// Associations');

    if (assocIndex !== -1) {
        mainDef = code.substring(0, assocIndex);
        assocPart = code.substring(assocIndex);
    }

    // Hapus export lama dari main part (jika ada)
    mainDef = mainDef.replace(new RegExp(`module\\.exports\\s*=\\s*${modelName};`), '').trim();

    // Bangun ulang struktur sebagai Factory Function
    let newCode = `module.exports = (sequelize, DataTypes) => {\n`;
    newCode += `    ${mainDef.split('\n').join('\n    ')}\n`; // indent

    if (assocPart) {
        // Bersihkan export lama dari assoc part
        assocPart = assocPart.replace(new RegExp(`module\\.exports\\s*=\\s*${modelName};`), '').trim();

        // Ganti referensi User, Order, dll menjadi models.User, models.Order
        modelNames.forEach(m => {
            const regex = new RegExp(`\\b${m}\\b(?!')`, 'g');
            assocPart = assocPart.replace(regex, `models.${m}`);
        });

        newCode += `\n    ${modelName}.associate = (models) => {\n`;
        newCode += `        ${assocPart.split('\n').join('\n        ')}\n`;
        newCode += `    };\n`;
    }

    newCode += `\n    return ${modelName};\n};\n`;

    // Tulis ulang filenya
    fs.writeFileSync(filePath, newCode, 'utf8');
    console.log(`✅ Refactored: ${file}`);
});
