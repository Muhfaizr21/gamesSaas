const axios = require('axios');
const { Setting } = require('../models');

class WhatsappService {
    async getToken() {
        const setting = await Setting.findOne({ where: { key: 'fonnte_token' } });
        return setting ? setting.value : null;
    }

    async sendMessage(target, message) {
        try {
            if (!target) return false;

            // Format number from 08x to 628x
            let formattedTarget = target;
            if (formattedTarget.startsWith('0')) {
                formattedTarget = '62' + formattedTarget.substring(1);
            }

            const token = await this.getToken();
            if (!token || token.trim() === '') {
                console.log('WhatsApp: Fonnte token not configured. Skipping WA msg to', formattedTarget);
                return false;
            }

            const response = await axios.post('https://api.fonnte.com/send', {
                target: formattedTarget,
                message: message,
                countryCode: '62'
            }, {
                headers: {
                    Authorization: token
                }
            });

            console.log('WhatsApp sent to', formattedTarget);
            return true;
        } catch (error) {
            console.error('WhatsApp Error:', error.response?.data || error.message);
            return false;
        }
    }
}

module.exports = new WhatsappService();
