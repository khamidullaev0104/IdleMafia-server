const axios = require('axios');
const { buildingParseModule } = require('../common/parse');
const BuildingSchema = require('../models/Schemas/BuildingSchema');
const {
  OFF_SEASON,
  ERROR_ACCESS_DM,
  BUILDING_COMMAND_ENEMY_START_STRING,
  BUILDING_COMMAND_YOUR_START_STRING,
  ERROR_BUILDING_COMMAND,
  ERROR_EMPTY_DB,
} = require('../config/string');

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
    if (res_msg === null || res_msg === undefined) return ERROR_ACCESS_DM;
    if (res_msg.data[0].content === OFF_SEASON) return OFF_SEASON;
    if (
      res_msg.data[0].embeds[0].description !==
        BUILDING_COMMAND_ENEMY_START_STRING ||
      res_msg.data[1].embeds[0].description !==
        BUILDING_COMMAND_YOUR_START_STRING
    )
      return ERROR_BUILDING_COMMAND;
    datas.your.push(...res_msg.data[1].embeds[0].fields);
    datas.enemy.push(...res_msg.data[0].embeds[0].fields);
    return await buildingParseModule(datas);
  } catch (err) {
    console.log('getBuildingResult error', err);
  }
};

const getBuildingResultFromDB = async (date) => {
  try {
    let res;
    if (date === '-1') res = await BuildingSchema.findOne().sort({ _id: -1 });
    else res = await BuildingSchema.findOne({ Date: { $gte: date } });
    if (!res) return ERROR_EMPTY_DB;
    return res;
  } catch (err) {
    console.log('getBuildingResultFromDB ERROR:', err);
  }
};

module.exports = {
  getBuildingResult,
  getBuildingResultFromDB,
};
