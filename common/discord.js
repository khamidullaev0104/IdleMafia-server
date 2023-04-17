const axios = require('axios');

const UserSchema = require('../models/Schemas/UserSchema');

async function authorizeWithDiscord(code) {
  const tokenResponseData = await axios.post(
    'https://discord.com/api/oauth2/token',
    new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
      scope: 'identify',
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return tokenResponseData.data;
}

async function saveAuthData(userId, actualData) {
  const user = await UserSchema.findOne({ _id: userId });
  if (!user) {
    return;
  }

  user.DiscordAuthData = {
    accessToken: actualData.access_token,
    expiresIn: actualData.expires_in,
    refreshToken: actualData.refresh_token,
    scope: actualData.scope,
    tokenType: actualData.token_type,
    isActive: true,
  };

  await user.save();
}

async function removeAuthData(userId) {
  const user = await UserSchema.findOne({ _id: userId });
  if (!user) {
    return;
  }

  user.DiscordAuthData = null;
  await user.save();
}

module.exports = { authorizeWithDiscord, saveAuthData, removeAuthData };
