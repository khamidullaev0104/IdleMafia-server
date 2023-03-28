const axios = require('axios');
const getLevelCommand = require('../common/parseImage');

const getLevelResult = async (email, token, BotfatherChannelId) => {
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
      if(res_msg.data[i].content.includes("Player rank, top 5 fight power,")) break;
      const img = res_msg.data[i].attachments[0].url;
      let dataLevel = await getLevelCommand(0, img, email);
      datas.push(...dataLevel);
    }
    return datas;
}

const getLevelResultTest = async (email) => {
    let datas = [];
    let dataLevel1 = await getLevelCommand(0, "data/source/capos1.png", email);
    datas.push(...dataLevel1);
    let dataLeve2 = await getLevelCommand(1, "data/source/capos2.png", email);
    datas.push(...dataLeve2);

    return datas;
}

module.exports = {
    getLevelResult,
    getLevelResultTest
};