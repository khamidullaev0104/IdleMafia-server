const axios = require('axios');
const { attackParseModule } = require('../common/parse');
const  getAttackResult = async (token, BotfatherChannelId) => {
    try{
        let datas = [];
        for(let i = 0; ; i++){
          let res_msg = await axios.get(
            `https://discord.com/api/v9/channels/${BotfatherChannelId}/messages?limit=${i+1}`, {
            headers: {
                'authorization': token,
                'content-type': 'application/json'
            }
          })
          datas.push(...res_msg.data[i].embeds[0].fields)
          if(typeof res_msg.data[i].embeds[0].description !== 'undefined' && res_msg.data[i].embeds[0].description.includes("For # of GvG attacks remaining, # of GvG defense available")) break;
        }
        const res = await attackParseModule(datas);
        return res;
    } catch(err) {
        console.log("getAttackResult error", err)
    }
}

module.exports = {
    getAttackResult    
}; 