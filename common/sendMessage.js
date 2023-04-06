const axios = require('axios');

async function sendMessageToChannel(token, channelID, botFatherID, message) {
  try {
    await axios.post(
      `https://discord.com/api/v9/channels/${channelID}/messages`,
      { content: '<@' + botFatherID + '> ' + message },
      {
        headers: {
          authorization: token,
          'content-type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.log('sendMessage Error', err);
  }
}

module.exports = sendMessageToChannel;
