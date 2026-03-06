const axios = require('axios');
const md5 = require('md5');

const DIGIFLAZZ_API_URL = 'https://api.digiflazz.com/v1';

// ---- Daily Sync Rate Limit Tracker ----
// DigiFlazz Development Key: ~25 price-list requests/day
// Production Key: much higher (hundreds/day)
const DAILY_LIMIT = 25;
let rateTracker = {
    date: null,    // today's date string (YYYY-MM-DD)
    count: 0,      // how many syncs done today
    lastReset: null
};

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function incrementSyncCount() {
    const today = getTodayStr();
    if (rateTracker.date !== today) {
        // New day — reset counter
        rateTracker.date = today;
        rateTracker.count = 0;
        rateTracker.lastReset = today;
    }
    rateTracker.count++;
}

function getSyncStatus() {
    const today = getTodayStr();
    if (rateTracker.date !== today) {
        return { used: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT, date: today };
    }
    return {
        used: rateTracker.count,
        limit: DAILY_LIMIT,
        remaining: Math.max(0, DAILY_LIMIT - rateTracker.count),
        date: rateTracker.date
    };
}

module.exports.getSyncStatus = getSyncStatus;

class DigiflazzService {
    constructor() {
        this.username = process.env.DIGIFLAZZ_USERNAME;
        this.key = process.env.DIGIFLAZZ_KEY;
    }

    _generateSign(command) {
        return md5(this.username + this.key + command);
    }

    async checkBalance() {
        try {
            const payload = {
                cmd: "deposit",
                username: this.username,
                sign: this._generateSign("depo")
            };

            const response = await axios.post(`${DIGIFLAZZ_API_URL}/cek-saldo`, payload);
            return response.data.data;
        } catch (error) {
            console.error('DigiFlazz Check Balance Error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getPriceList() {
        try {
            const payload = {
                cmd: "prepaid",
                username: this.username,
                sign: this._generateSign("pricelist")
            };

            // Track sync usage
            incrementSyncCount();

            const response = await axios.post(`${DIGIFLAZZ_API_URL}/price-list`, payload);

            // Jika sukses dan isinya array produk
            if (response.data && Array.isArray(response.data.data)) {
                return response.data.data;
            }

            // Jika gagal (seperti kena limitasi / data bukan array)
            console.warn("DigiFlazz API Response:", response.data);
            return {
                error: true,
                message: response.data.data?.message || response.data?.message || "Koneksi ke DigiFlazz gagal (Rate Limit / Bukan Array)."
            };

        } catch (error) {
            console.warn('DigiFlazz Price List Error:', error.message);
            return {
                error: true,
                message: error.response?.data?.message || "Rate limit error atau gagal terkoneksi ke DigiFlazz"
            };
        }
    }

    _getMockPriceList() {
        return [
            {
                buyer_sku_code: "ML5",
                buyer_product_status: true,
                seller_product_status: true,
                product_name: "5 Diamonds",
                category: "Games",
                brand: "Mobile Legends",
                price: 1500,
                unlimited_stock: false,
                stock: 100
            },
            {
                buyer_sku_code: "ML10",
                buyer_product_status: true,
                seller_product_status: true,
                product_name: "10 Diamonds",
                category: "Games",
                brand: "Mobile Legends",
                price: 2800,
                unlimited_stock: true,
                stock: 0
            },
            {
                buyer_sku_code: "FF70",
                buyer_product_status: true,
                seller_product_status: true,
                product_name: "70 Diamonds",
                category: "Games",
                brand: "Free Fire",
                price: 10000,
                unlimited_stock: true,
                stock: 0
            },
            {
                buyer_sku_code: "GI60",
                buyer_product_status: true,
                seller_product_status: true,
                product_name: "60 Genesis Crystals",
                category: "Games",
                brand: "Genshin Impact",
                price: 13500,
                unlimited_stock: true,
                stock: 0
            }
        ];
    }

    async createTransaction(sku, customerId, refId) {
        try {
            const payload = {
                username: this.username,
                buyer_sku_code: sku,
                customer_no: customerId,
                ref_id: refId,
                sign: this._generateSign(refId)
            };

            const response = await axios.post(`${DIGIFLAZZ_API_URL}/transaction`, payload);
            return response.data.data;
        } catch (error) {
            console.error('DigiFlazz Transaction Error:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new DigiflazzService();
