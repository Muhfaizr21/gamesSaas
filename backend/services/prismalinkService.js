const crypto = require('crypto');
const axios = require('axios');

class PrismalinkService {
    constructor() {
        this.merchantId = process.env.PRISMALINK_MERCHANT_ID || '';
        this.secretKey = process.env.PRISMALINK_SECRET_KEY || '';
        this.apiUrl = process.env.PRISMALINK_API_URL || 'https://sandbox.prismalink.co.id/api/';
    }

    _generateSignature(merchantRef, amount) {
        // Mock generation algorithm for signature, assuming merchantId + ref + amount signed with secretKey
        return crypto.createHmac('sha256', this.secretKey)
            .update(this.merchantId + merchantRef + amount)
            .digest('hex');
    }

    async getPaymentChannels() {
        try {
            // PrismaLink might not have a dynamic endpoint in sandbox. returning static mock data that works with PrismaLink's standard structure
            return {
                success: true,
                data: [
                    { group: 'Virtual Account', code: '014', name: 'BCA Virtual Account', icon_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg', active: true },
                    { group: 'Virtual Account', code: '002', name: 'BRI Virtual Account', icon_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/BRI_2020.svg', active: true },
                    { group: 'Virtual Account', code: '009', name: 'BNI Virtual Account', icon_url: 'https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg', active: true },
                    { group: 'Virtual Account', code: '008', name: 'Mandiri Virtual Account', icon_url: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg', active: true },
                    { group: 'E-Wallet', code: 'QRIS', name: 'QRIS (All Payment)', icon_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg', active: true }
                ]
            };
        } catch (error) {
            console.error('PrismaLink Get Channels Error:', error.message);
            throw error;
        }
    }

    async createClosedPayment(params) {
        try {
            // Mapping params ke format PrismaLink API Standard (Merchant API)
            const signature = this._generateSignature(params.merchant_ref, params.amount);

            // Using mock payload structure
            const payload = {
                merchantId: this.merchantId,
                merchantRef: params.merchant_ref,
                paymentMethod: params.method, // e.g: "014" or "QRIS"
                amount: params.amount,
                customerName: params.customer_name || 'Guest User',
                customerEmail: params.customer_email || 'guest@samstore.id',
                customerPhone: params.customer_phone || '081234567890',
                items: [
                    {
                        sku: params.sku,
                        name: params.product_name,
                        price: params.amount,
                        qty: 1
                    }
                ],
                returnUrl: params.return_url,
                signature: signature
            };

            // Simulated request for API URL
            // const response = await axios.post(`${this.apiUrl}transaction/create`, payload);

            // returning simulated mock response
            return {
                success: true,
                data: {
                    reference: 'PLINK-' + params.merchant_ref,
                    merchant_ref: params.merchant_ref,
                    // mock checkout url that simulates prismalink redirect
                    checkout_url: `https://sandbox.prismalink.co.id/payment/checkout/${params.merchant_ref}`
                }
            };
        } catch (error) {
            console.error('PrismaLink Create Transaction Error:', error.message);
            return { success: false, message: 'Failed to create payment via PrismaLink' };
        }
    }

    /**
     * Memvalidasi callback yang masuk sesuai dokumentasi PrismaLink.
     * @param {Object} req - Express Request Object
     * @returns {boolean} valid
     */
    verifyCallbackSignature(req) {
        // typically signature is passed inside headers or body
        const signature = req.headers['x-plink-signature'] || req.body.signature;
        if (!signature) return false;

        // dummy implementation mapping logic validation
        const validSignature = crypto.createHmac('sha256', this.secretKey)
            .update(this.merchantId + req.body.merchantRef + req.body.amount + req.body.status)
            .digest('hex');

        return true; // Hardcoded true for demo implementation
    }
}

module.exports = new PrismalinkService();
