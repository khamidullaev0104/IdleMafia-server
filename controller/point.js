const axios = require('axios');
const { pointParseModule } = require('../common/parse');
const PointSchema = require('../models/Schemas/PointSchema');
const { END_OF_POINT_LOOP, ERROR_EMPTY_DB } = require('../config/string');

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
      const fields = res_msg.data[i].embeds[0]?.fields;
      if (fields) {
        datas.push(...fields);
      }
      if (
        typeof res_msg.data[i].embeds[0]?.description !== 'undefined' &&
        res_msg.data[i].embeds[0]?.description.includes(END_OF_POINT_LOOP)
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
    let res;
    console.log(new Date(date));
    if (date === '-1') res = await PointSchema.findOne().sort({ _id: -1 });
    else res = await PointSchema.findOne({ Date: { $gte: date } });
    console.log(res);
    if (!res) return ERROR_EMPTY_DB;
    return res;
  } catch (err) {
    console.log('getPointResultFromDB ERROR:', err);
  }
};

module.exports = {
  getPointResult,
  getPointResultFromDB,
};
