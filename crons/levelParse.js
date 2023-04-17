const connectDB = require('../config/db');
const getChannelID = require('../common/getChannelID');
require('dotenv').config();

const { axiosPostToChannel } = require('../common/axiosFunctions');
const { getLevelResult } = require('../controller/level');

async function OnDbConnected() {
  if (process.env.DEBUG ?? false) console.log(`OnDbConnected`);

  await axiosPostToChannel('messages', process.env.CHANNEL_ID, 'level');
  await new Promise((r) => setTimeout(r, 10*1000));

  const BotfatherChannelId = await getChannelID(
    process.env.DISCORD_TOKEN,
    process.env.BOTFATHER_ID
  );

  if (BotfatherChannelId === undefined) {
    if (process.env.DEBUG ?? false)
      console.log(`Problem with BotfatherChannelId`);
    process.exit();
  }

  await getLevelResult(process.env.DISCORD_TOKEN, BotfatherChannelId);

  process.exit();
}

connectDB().on('error', console.log).once('open', OnDbConnected);
