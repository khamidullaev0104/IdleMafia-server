const axios = require('axios');
const { getChannelUrl } = require('./getChannelUrl');

async function get(url) {
  if (process.env.DEBUG ?? false) console.log('[axios]', url);

  return await axios.get(url, {
    headers: {
      authorization: process.env.DISCORD_TOKEN ?? 'NO TOKEN ',
      'content-type': 'application/json',
    },
  });
}

async function getChannel(url, channelId, parametersRaw = []) {
  return get(getChannelUrl(url, channelId, parametersRaw));
}

module.exports = {
  axiosGet: get,
  axiosGetChannel: getChannel,
};
