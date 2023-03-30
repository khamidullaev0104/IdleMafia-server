const { attackParseModule } = require('../common/parse');
const { axiosGetChannel } = require('../common/axiosFunctions');
const OFF_SEASON = 'Off season';
const END_OF_LOOP =
  'For # of GvG attacks remaining, # of GvG defense available';

const getAttackResult = async (token, ChannelId) => {
  try {
    let dataToParse = [];
    for (let i = 0; ; i++) {
      let res_msg = await axiosGetChannel('messages', ChannelId, [
        ['limit', i + 1],
      ]);
      if (res_msg.data[i].content === OFF_SEASON) return OFF_SEASON;

      let embeds = res_msg.data[i].embeds[0];
      dataToParse.push(...embeds.fields);

      if (
        typeof embeds.description !== 'undefined' &&
        embeds.description.includes(END_OF_LOOP)
      )
        break;
    }
    return await attackParseModule(dataToParse);
  } catch (err) {
    console.log('getAttackResult error', err);
  }
};

module.exports = {
  getAttackResult,
};
