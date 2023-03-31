const axios = require('axios');
const { pointParseModule } = require('../common/parse');

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
    return res;
  } catch (err) {
    console.log('getPointResult error', err);
  }
};

module.exports = {
  getPointResult,
};
