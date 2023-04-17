const axios = require('axios');
const { getChannelUrl } = require('./getChannelUrl');
const { getUserDiscordToken } = require('./discord');

const Cache = require('ttl-file-cache');
const axiosCache = new Cache({ dir: './data/cache' });

async function headers(userId) {
  const discordToken = await getUserDiscordToken(userId);

  return {
    authorization: discordToken ?? 'NO TOKEN ',
    'content-type': 'application/json',
  };
}

async function get(url, userId) {
  if (process.env.DEBUG ?? false) console.log('[axios]GET', url);
  if (process.env.DEBUG ?? false)
    console.log(`[axios]Cache:${process.env.USE_CACHE}`);
  let result = null;
  let key = (await headers(userId)).authorization + url;

  if (process.env.USE_CACHE === 'true') result = axiosCache.get(key);

  if (result === null) {
    result = await axios.get(url, {
      headers: await headers(userId),
    });
    if (process.env.USE_CACHE === 'true')
      axiosCache.set(key, result.data, parseInt(process.env.CACHE_TTL));
  } else {
    if (process.env.DEBUG ?? false) console.log(`[axios]Cached get request`);
    result = { data: JSON.parse(result.toString()) };
  }

  return result;
}

async function post(url, message, userId) {
  if (process.env.DEBUG ?? false)
    console.log('[axios]POST', `${url}:${message}`);
  if (process.env.DEBUG ?? false) console.log(await headers(userId));

  return await axios.post(
    url,
    {
      content:
        '<@' + (process.env.BOTFATHER_ID ?? 'NO TOKEN ') + '> ' + message,
    },
    {
      headers: await headers(userId),
    }
  );
}

async function getChannel(url, channelId, parametersRaw = []) {
  return await get(getChannelUrl(url, channelId, parametersRaw));
}

async function postToChannel(url, channelId, message, userId) {
  return await post(getChannelUrl(url, channelId), message, userId);
}

module.exports = {
  axiosGet: get,
  axiosPost: post,
  axiosGetChannel: getChannel,
  axiosPostToChannel: postToChannel,
};
