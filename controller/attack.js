const { attackParseModule, loadAttackModule } = require('../common/parse');
const AttackSchema = require('../models/Schemas/AttackSchema');
const axios = require('axios');
const { OFF_SEASON, END_OF_ATTACK_LOOP } = require('../config/string');

const getAttackResult = async (token, BotfatherChannelId) => {
  try {
    let dataToParse = [];
    for (let i = 0; ; i++) {
      let res_msg = await axios.get(
        `https://discord.com/api/v9/channels/${BotfatherChannelId}/messages?limit=${
          i + 1
        }`,
        {
          headers: {
            authorization: token,
            'content-type': 'application/json',
          },
        }
      );
      if (res_msg.data[i].content === OFF_SEASON) return OFF_SEASON;

      let embeds = res_msg.data[i].embeds[0];
      dataToParse.push(...embeds.fields);

      if (
        typeof embeds.description !== 'undefined' &&
        embeds.description.includes(END_OF_ATTACK_LOOP)
      )
        break;
    }
    return await attackParseModule(dataToParse);
  } catch (err) {
    console.log('getAttackResult error', err);
  }
};

const loadAttackResult = async () => {
  return await loadAttackModule();
};

const getAttackResultFromDB = async (date) => {
  try {
    if (date === '-1') return await AttackSchema.findOne().sort({ _id: -1 });
    else return await AttackSchema.find({ date: { $gte: date } });
  } catch (err) {
    console.log('getLevelResultFromDB ERROR:', err);
  }
};

module.exports = {
  getAttackResult,
  loadAttackResult,
  getAttackResultFromDB,
};
