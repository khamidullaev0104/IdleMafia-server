function getChannelUrl(url, channelId, parametrsRaw = []) {
  let base = 'https://discord.com/api/v9';
  let result = `${base}/channels/${channelId}/${url}`;
  if (!parametrsRaw) return result;

  result += '?';
  let parametrsArray = [];
  parametrsRaw.forEach((parameter) => {
    parametrsArray.push(`${parameter[0]}=${parameter[1]}`);
  });

  let parametrsString = parametrsArray.join('&');
  result += parametrsString;

  return result;
}

module.exports = { getChannelUrl };
