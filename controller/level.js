const axios = require('axios');
const getLevelCommand = require('../common/parseImage');

const getLevelResult = async (token, BotfatherChannelId) => {
    // Get message from specific channel with limit
    let datas = [];
    for(let i = 0; ; i++){
      let res_msg = await axios.get(
        `https://discord.com/api/v9/channels/${BotfatherChannelId}/messages?limit=${i+1}`, { // 1077107224972898305 is Botfather's DM channel id
        headers: {
            'authorization': token,
            'content-type': 'application/json'
        }
      })
      const img = res_msg.data[i].attachments[0].url;
      let dataLevel = await getLevelCommand(0, img);
      datas.push(...dataLevel);
      if(res_msg.data[i].content.includes("Player rank, top 5 fight power,")) break;
    }
    return datas;
}

const getLevelResultTest = async (token, BotfatherChannelId) => {
    let datas = [];
    let dataLevel1 = await getLevelCommand(0, "data/source/capos1.png");
    datas.push(...dataLevel1);
    let dataLeve2 = await getLevelCommand(1, "data/source/capos2.png");
    datas.push(...dataLeve2);

    return datas;
}

module.exports = {
    getLevelResult,
    getLevelResultTest
};