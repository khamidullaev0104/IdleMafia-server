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
    console.log('sendMessage Error', err.response);
    if([400,401,402,403].indexOf(err.response.status)!==-1){
      throw new Error('Problem with discord access, probably token is expired');
    }

    throw new Error(err.response);
  }
}

module.exports = sendMessageToChannel;
