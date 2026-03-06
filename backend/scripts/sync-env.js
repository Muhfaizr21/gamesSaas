const dotenv = require('dotenv');
const logger = require('../utils/logger');
const path = require('path');

dotenv.config();

function verifyEnv() {
    logger.info("Checking environment configuration...");

    const requiredKeys = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET', 'DIGIFLAZZ_USERNAME', 'DIGIFLAZZ_KEY'];
    let missing = [];

    requiredKeys.forEach(key => {
        if (!process.env[key]) missing.push(key);
    });

    if (missing.length > 0) {
        logger.error(`Missing required environment variables: ${missing.join(', ')}`);
        return false;
    }

    // Check if in Sandbox mode
    const isSandboxDigi = process.env.DIGIFLAZZ_KEY && process.env.DIGIFLAZZ_KEY.startsWith('dev-');
    const isSandboxPrisma = process.env.PRISMALINK_API_URL && process.env.PRISMALINK_API_URL.includes('sandbox');

    if (isSandboxDigi || isSandboxPrisma) {
        logger.warn("⚠️ SYSTEM IS RUNNING IN SANDBOX MODE");
    } else {
        logger.success("✅ SYSTEM IS RUNNING IN PRODUCTION MODE");
    }

    logger.success("Environment verification passed!");
    return true;
}

verifyEnv();
