const UserSchema = require('../models/Schemas/UserSchema');

async function getTokenFromProfile(userId) {
  const user = await UserSchema.findOne({ _id: userId });
  return user.DiscordData?.token;
}

async function getUserDiscordToken(userId) {
  const discordToken =
    process.env.DISCORD_TOKEN || (await getTokenFromProfile(userId));
  return discordToken;
}

module.exports = {
  getUserDiscordToken,
};
