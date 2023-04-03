const axios = require('axios');
const { getChannelUrl } = require('./getChannelUrl');

async function headers() {
  return {
    authorization: process.env.DISCORD_TOKEN ?? 'NO TOKEN ',
    'content-type': 'application/json',
  };
}

async function get(url) {
  if (process.env.DEBUG ?? false) console.log('[axios]GET', url);

  return await axios.get(url, {
    headers: headers,
  });
}

async function post(url, message) {
  if (process.env.DEBUG ?? false)
    console.log('[axios]POST', `${url}:${message}`);

  await axios.post(
    url,
    {
      content: '<@' + process.env.BOTFATHER_ID ?? 'NO TOKEN ' + '> ' + message,
    },
    {
      headers: headers,
    }
  );
}

async function getChannel(url, channelId, parametersRaw = []) {
  return get(getChannelUrl(url, channelId, parametersRaw));
}

async function postToChannel(url, channelId, message) {
  await post(getChannelUrl(url, channelId), message);
}

module.exports = {
  axiosGet: get,
  axiosPost: post,
  axiosGetChannel: getChannel,
  axiosPostToChannel: postToChannel,
};
