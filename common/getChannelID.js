const axios = require('axios');

async function getChannelID(token, botFatherID) {
    try {
        let res_channelList = await axios.get(
            "https://discordapp.com/api/users/@me/channels", {
                headers: {
                    'authorization': token,
                    'content-type': 'application/json'
                }
            })

        let BotfatherChannelId;
        res_channelList.data.forEach(element => {
            if (element.recipients[0].id === botFatherID) {
                BotfatherChannelId = element.id;
            }
        })
        return BotfatherChannelId;
    } catch (err) {
        console.log("getChannelID error", err);
    }
}

module.exports = getChannelID; 