const LevelSchema = require('../models/Schemas/LevelSchema');
const getLevelCommand = require('../common/parseImage');
const { END_OF_LEVEL_LOOP, ERROR_EMPTY_DB } = require('../config/string');
const { axiosGetChannel } = require('../common/axiosFunctions');

const getLevelResult = async (token, BotfatherChannelId, userId) => {
  // Get message from specific channel with limit
  let datas = [];
  const timeNow = Date.now();
  for (let i = 0; ; i++) {
    let res_msg = await axiosGetChannel(
      'messages',
      BotfatherChannelId,
      [['limit', i + 1]],
      userId
    );
    const img = res_msg.data?.[i]?.attachments?.[0]?.url;

    let dataLevel = await getLevelCommand(timeNow, i, img);
    datas.push(...dataLevel);
    if (res_msg.data[i].content.includes(END_OF_LEVEL_LOOP)) {
      console.log('End line reached');
      break;
    }
  }
  const level = new LevelSchema({
    Datas: datas,
  });
  const res = await level.save();

  return res;
};

const getLevelResultFromDB = async (date) => {
  try {
    let res;
    if (date === '-1') res = await LevelSchema.findOne().sort({ _id: -1 });
    else res = await LevelSchema.findOne({ Date: { $gte: new Date(date) } });
    if (!res) return ERROR_EMPTY_DB;
    return res;
  } catch (err) {
    console.log('getLevelResultFromDB ERROR:', err);
  }
};

module.exports = {
  getLevelResult,
  getLevelResultFromDB,
};
