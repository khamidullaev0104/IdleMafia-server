const axios = require('axios');
const { buildingParseModule } = require('../common/parse')

const  getBuildingResult = async (token, BotfatherChannelId) => {
    try{
        let datas = { your: [], enemy: []};
        let res_msg = await axios.get(
        `https://discord.com/api/v9/channels/${BotfatherChannelId}/messages?limit=${2}`, {
        headers: {
            'authorization': token,
            'content-type': 'application/json'
        }
        })
        datas.your.push(...res_msg.data[1].embeds[0].fields)
        datas.enemy.push(...res_msg.data[0].embeds[0].fields)
        const res = await buildingParseModule(datas);
        return res;
    } catch(err) {
        console.log("getBuildingResult error", err)
    }
}

module.exports = {
    getBuildingResult    
}; 