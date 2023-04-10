const axios = require('axios');
const { getChannelUrl } = require('./getChannelUrl');

const Cache = require('ttl-file-cache');
const axiosCache = new Cache({ dir: './data/cache' });

function headers() {
  return {
    authorization: process.env.DISCORD_TOKEN ?? 'NO TOKEN ',
    'content-type': 'application/json',
  };
}

async function get(url) {
  if (process.env.DEBUG ?? false) console.log('[axios]GET', url);
  if (process.env.DEBUG ?? false)
    console.log(`[axios]Cache:${process.env.USE_CACHE}`);
  let result = null;
  let key = JSON.stringify(headers()) + url;

  if (process.env.USE_CACHE === 'true') result = axiosCache.get(key);


  if (result === null) {
    result = await axios.get(url, {
      headers: headers(),
    });
    if (process.env.USE_CACHE === 'true')
      axiosCache.set(key, result.data, parseInt(process.env.CACHE_TTL));
  } else {
    if (process.env.DEBUG ?? false) console.log(`[axios]Cached get request`);
    result = { data: JSON.parse(result.toString()) };
  }

  return result;
}

async function post(url, message) {
  if (process.env.DEBUG ?? false)
    console.log('[axios]POST', `${url}:${message}`);
  if (process.env.DEBUG ?? false) console.log(headers());

  return await axios.post(
    url,
    {
      content:
        '<@' + (process.env.BOTFATHER_ID ?? 'NO TOKEN ') + '> ' + message,
    },
    {
      headers: headers(),
    }
  );
}

async function getChannel(url, channelId, parametersRaw = []) {
  return await get(getChannelUrl(url, channelId, parametersRaw));
}

async function postToChannel(url, channelId, message) {
  return await post(getChannelUrl(url, channelId), message);
}

module.exports = {
  axiosGet: get,
  axiosPost: post,
  axiosGetChannel: getChannel,
  axiosPostToChannel: postToChannel,
};
