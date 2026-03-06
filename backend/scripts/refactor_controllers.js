const fs = require('fs');
const path = require('path');

function processFolder(folderPath) {
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        let code = fs.readFileSync(filePath, 'utf8');

        // Regex untuk menemukan semua import model yang Singleton
        // contoh: const User = require('../models/User');
        const modelImportRegex = /const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*require\('\.\.?\/models\/[A-Z][a-zA-Z0-9_]*'\);\r?\n/g;

        let match;
        const importedModels = new Set();
        while ((match = modelImportRegex.exec(code)) !== null) {
            importedModels.add(match[1]);
        }

        // Hapus import statis
        code = code.replace(modelImportRegex, '');

        // Hapus juga import sequelize global jika ada
        code = code.replace(/const\s+sequelize\s*=\s*require\('\.\.?\/config\/database'\);\r?\n/g, '');

        if (importedModels.size === 0) {
            // tidak pakai model, biarkan saja
            fs.writeFileSync(filePath, code, 'utf8');
            return;
        }

        const modelList = Array.from(importedModels).join(', ');

        // Cari semua deklarasi fungsi (req, res) dan sisipkan destruct models di baris pertama jalannya fungsi
        const funcRegex = /(\(\s*(?:req|req,\s*res|req,\s*res,\s*next)\s*\)\s*(?:=>\s*)?\{)/g;

        code = code.replace(funcRegex, (fullMatch) => {
            return `${fullMatch}\n        const { ${modelList} } = req.db.models;`;
        });

        // Ganti pemanggilan 'sequelize.fn' dll menjadi 'req.db.fn' karena sequelize local sudah dihapus
        code = code.replace(/\bsequelize\./g, 'req.db.');

        fs.writeFileSync(filePath, code, 'utf8');
        console.log(`✅ Refactored Context-Aware req.db.models di: ${file}`);
    });
}

// Eksekusi untuk Controllers dan Middlewares
processFolder(path.join(__dirname, '../controllers'));
processFolder(path.join(__dirname, '../middlewares'));

