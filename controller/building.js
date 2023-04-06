const axios = require('axios');
const { buildingParseModule } = require('../common/parse');
const BuildingSchema = require('../models/Schemas/BuildingSchema');
const { OFF_SEASON } = require('../config/string');

const getBuildingResult = async (token, BotfatherChannelId) => {
  try {
    let datas = { your: [], enemy: [] };
    let res_msg = await axios.get(
      `https://discord.com/api/v9/channels/${BotfatherChannelId}/messages?limit=2`,
      {
        headers: {
          authorization: token,
          'content-type': 'application/json',
        },
      }
    );
    if (res_msg.data[0].content === OFF_SEASON) return OFF_SEASON;
    datas.your.push(...res_msg.data[1].embeds[0].fields);
    datas.enemy.push(...res_msg.data[0].embeds[0].fields);
    return await buildingParseModule(datas);
  } catch (err) {
    console.log('getBuildingResult error', err);
  }
};

const getBuildingResultFromDB = async (date) => {
  try {
    if (date === '-1') return await BuildingSchema.findOne().sort({ _id: -1 });
    else return await BuildingSchema.find({ date: { $gte: date } });
  } catch (err) {
    console.log('getLevelResultFromDB ERROR:', err);
  }
};

module.exports = {
  getBuildingResult,
  getBuildingResultFromDB,
};
