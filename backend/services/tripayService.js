const crypto = require('crypto');
const axios = require('axios');

class TripayService {
    constructor(merchantCode, apiKey, privateKey, isProduction = false) {
        this.merchantCode = merchantCode;
        this.apiKey = apiKey;
        this.privateKey = privateKey;
        this.baseUrl = isProduction
            ? 'https://tripay.co.id/api/'
            : 'https://tripay.co.id/api-sandbox/';
    }

    _generateSignature(merchantRef, amount) {
        return crypto.createHmac('sha256', this.privateKey)
            .update(this.merchantCode + merchantRef + amount)
            .digest('hex');
    }

    async getPaymentChannels() {
        try {
            const response = await axios.get(`${this.baseUrl}merchant/payment-channel`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Tripay Get Channels Error:', error.response?.data || error.message);
            throw error;
        }
    }

    async createClosedPayment(params) {
        try {
            const signature = this._generateSignature(params.merchant_ref, params.amount);

            // Item configuration expected by Tripay
            const items = [
                {
                    sku: params.sku,
                    name: params.product_name,
                    price: params.amount,
                    quantity: 1
                }
            ];

            const payload = {
                method: params.method,
                merchant_ref: params.merchant_ref,
                amount: params.amount,
                customer_name: params.customer_name || 'Guest User',
                customer_email: params.customer_email || 'guest@samstore.id',
                customer_phone: params.customer_phone || '081234567890',
                order_items: items,
                return_url: params.return_url,
                signature: signature
            };

            const response = await axios.post(`${this.baseUrl}transaction/create`, payload, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: {
                        reference: response.data.data.reference,
                        merchant_ref: response.data.data.merchant_ref,
                        checkout_url: response.data.data.checkout_url
                    }
                };
            }

            return { success: false, message: response.data.message };

        } catch (error) {
            console.error('Tripay Create Transaction Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create payment via Tripay'
            };
        }
    }

    verifyCallbackSignature(req) {
        try {
            const tripaySignature = req.headers['x-callback-signature'];
            if (!tripaySignature) return false;

            const payload = JSON.stringify(req.body);

            const signature = crypto.createHmac('sha256', this.privateKey)
                .update(payload)
                .digest('hex');

            return signature === tripaySignature;
        } catch (e) {
            console.error('Tripay Callback Verification Error:', e);
            return false;
        }
    }
}

module.exports = TripayService;
