const LevelSchema = require('../models/Schemas/LevelSchema');
const getLevelCommand = require('../common/parseImage');
const { END_OF_LEVEL_LOOP } = require('../config/string');
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
    const img = res_msg.data[i].attachments[0].url;

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
    if (date === '-1') return await LevelSchema.findOne().sort({ _id: -1 });
    else return await LevelSchema.find({ date: { $gte: date } });
  } catch (err) {
    console.log('getLevelResultFromDB ERROR:', err);
  }
};

module.exports = {
  getLevelResult,
  getLevelResultFromDB,
};
