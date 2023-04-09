const { axiosGet } = require('../common/axiosFunctions');

async function getChannelID(token, botFatherID) {
  try {
    let res_channelList = await axiosGet(
      'https://discordapp.com/api/users/@me/channels'
    );

    let BotfatherChannelId;
    res_channelList.data.forEach((element) => {
      if (element.recipients[0].id === botFatherID) {
        BotfatherChannelId = element.id;
      }
    });
    return BotfatherChannelId;
  } catch (err) {
    console.log('getChannelID error', err);
  }
}

module.exports = getChannelID;
