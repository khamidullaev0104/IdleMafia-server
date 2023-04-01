const axios = require('axios');
const { pointParseModule } = require('../common/parse');
const PointSchema = require('../models/Schemas/PointSchema');

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
        res_msg.data[i].embeds[0].description.includes(
          'Gang points, Nemesis attack damages'
        )
      )
        break;
    }
    const res = await pointParseModule(datas);
    const point = new PointSchema({
      Datas: res,
    });
    return await point.save();
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
