const axios = require('axios');

async function loginByEmailPassword(email, password) {
    try{
        const ret = await axios.post('https://discord.com/api/v9/auth/login', {
            login: email,
            password: password,
        })
        return ret;
    } catch(err) {
        console.log("loginByEmailPassword error", err);
    }
}

async function getProfileFromToken(token) {
    try{
        const res = await axios.get(`https://discord.com/api/v9/users/@me`, {
          headers: {
            'authorization': token,
            'content-type': 'application/json'
          }
        })
        return res;
    } catch(err) {
        console.log("loginByEmailPassword error", err);
    }
}

module.exports = {
    loginByEmailPassword,
    getProfileFromToken
};