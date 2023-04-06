const axios = require('axios');
const { pointParseModule } = require('../common/parse');
const PointSchema = require('../models/Schemas/PointSchema');
const { END_OF_POINT_LOOP } = require('../config/string');

const getPointResult = async (token, BotfatherChannelId) => {
  try {
    let datas = [];
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
      datas.push(...res_msg.data[i].embeds[0].fields);
      if (
        typeof res_msg.data[i].embeds[0].description !== 'undefined' &&
        res_msg.data[i].embeds[0].description.includes(END_OF_POINT_LOOP)
      )
        break;
    }
    return await pointParseModule(datas);
  } catch (err) {
    console.log('getPointResult error', err);
  }
};

const getPointResultFromDB = async (date) => {
  try {
    if (date === '-1') return await PointSchema.findOne().sort({ _id: -1 });
    else return await PointSchema.find({ date: { $gte: date } });
  } catch (err) {
    console.log('getPointResultFromDB ERROR:', err);
  }
};

module.exports = {
  getPointResult,
  getPointResultFromDB,
};
