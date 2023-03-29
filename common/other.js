const axios = require('axios');
const User = require('../models/User');

async function loginByDiscordEmailPassword(email, password) {
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

async function getUserInfoById(id) {
    try {
        const user = await User.findById(id).select('-password');
        return user;
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}


module.exports = {
    loginByDiscordEmailPassword,
    getProfileFromToken,
    getUserInfoById
};