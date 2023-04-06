const axios = require('axios');
const LevelSchema = require('../models/Schemas/LevelSchema');
const getLevelCommand = require('../common/parseImage');
const { END_OF_LEVEL_LOOP } = require('../config/string');

const getLevelResult = async (token, BotfatherChannelId) => {
  // Get message from specific channel with limit
  let datas = [];
  const timeNow = Date.now();
  for (let i = 0; ; i++) {
    let res_msg = await axios.get(
      `https://discord.com/api/v9/channels/${BotfatherChannelId}/messages?limit=${
        i + 1
      }`,
      {
        // 1077107224972898305 is Botfather's DM channel id
        headers: {
          authorization: token,
          'content-type': 'application/json',
        },
      }
    );
    const img = res_msg.data[i].attachments[0].url;
    let dataLevel = await getLevelCommand(timeNow, i, img);
    datas.push(...dataLevel);
    if (res_msg.data[i].content.includes(END_OF_LEVEL_LOOP)) break;
  }
  const level = new LevelSchema({
    Datas: datas,
  });
  const res = await level.save();

  return res;
};

const getLevelResultFromDB = async (date) => {
  try {
    if (date === '-1') return await LevelSchema.findOne().sort({ _id: -1 });
    else return await LevelSchema.find({ date: { $gte: date } });
  } catch (err) {
    console.log('getLevelResultFromDB ERROR:', err);
  }
};

module.exports = {
  getLevelResult,
  getLevelResultFromDB,
};
