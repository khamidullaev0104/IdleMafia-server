const axios = require('axios');
const UserSchema = require('../models/Schemas/UserSchema');
const PointSchema = require('../models/Schemas/PointSchema');
const LevelSchema = require('../models/Schemas/LevelSchema');

async function loginByDiscordEmailPassword(email, password) {
  try {
    const ret = await axios.post('https://discord.com/api/v9/auth/login', {
      login: email,
      password: password,
    });
    return ret;
  } catch (err) {
    console.log('loginByEmailPassword error: ', err);
  }
}

async function getProfileFromToken(token) {
  try {
    const res = await axios.get(`https://discord.com/api/v9/users/@me`, {
      headers: {
        authorization: token,
        'content-type': 'application/json',
      },
    });
    return res;
  } catch (err) {
    console.log('loginByEmailPassword error: ', err);
  }
}

async function getUserInfoById(id) {
  try {
    const user = await UserSchema.findById(id).select('-password');
    return user;
  } catch (err) {
    console.error('getUserInfoById error: ', err.message);
  }
}

async function getTotalNumberOfGangMember() {
  try {
    return await PointSchema.findOne().sort({ _id: -1 });
  } catch (err) {
    console.error('getTotalNumberOfGangMember error: ', err.message);
  }
}

async function memberRankByFP() {
  try {
    const res = await LevelSchema.findOne().sort({ _id: -1 });
    console.log(res);
    if (res === null) return res;
    res.Datas.sort((a, b) => (a.tfp > b.tfp ? 1 : b.tfp > a.tfp ? -1 : 0));
    return res;
  } catch (err) {
    console.error('memberRankByFP error: ', err.message);
  }
}

async function getTimeUntilGW() {
  try {
    const cDate = new Date();
    let tDate = new Date();

    let targetDate;
    let curDay = tDate.getUTCDay();
    if(curDay > 4) targetDate = tDate.getDate() + 7 - curDay + 4;
    else targetDate = tDate.getDate() + 4 - curDay;

    tDate.setUTCSeconds(0);
    tDate.setUTCMinutes(0);
    tDate.setUTCHours(0);
    tDate.setUTCDate(targetDate);

    const diffTime = (tDate.getTime() - cDate.getTime()) / 1000;

    const res = {
      days: Math.floor((diffTime/(3600*24)) % 31),
      hours:	Math.floor((diffTime/3600) % 24),
      minutes: Math.floor((diffTime/60) % 60),
      seconds: diffTime % 60
    };
    return res;
  } catch (err) {
    console.error('memberRankByFP error: ', err.message);
  }
}

module.exports = {
  loginByDiscordEmailPassword,
  getProfileFromToken,
  getUserInfoById,
  getTotalNumberOfGangMember,
  memberRankByFP,
  getTimeUntilGW,
};