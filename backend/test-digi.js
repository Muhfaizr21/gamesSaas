const axios = require('axios');
const md5 = require('md5');

const username = 'limebuWj4xOo';
const devKey = 'dev-eefa84e0-dc45-11ea-89b4-9711ba372125';

async function test() {
    try {
        console.log("Cek saldo...");
        const payload = {
            cmd: "deposit",
            username: username,
            sign: md5(username + devKey + "depo")
        };
        const res = await axios.post('https://api.digiflazz.com/v1/cek-saldo', payload);
        console.log("Success:", res.data);
    } catch (e) {
        console.error("Failed:", e.response?.data || e.message);
    }
}
test();
