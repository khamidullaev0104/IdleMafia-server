const gravatar = require('gravatar');
const normalize = require('normalize-url');
const bcrypt = require('bcryptjs');

const UserSchema = require('../models/Schemas/UserSchema');
const {
  ERROR_USER_EXIST,
  ERROR_SERVER,
  PERMISSION_USER,
  PERMISSION_ADMIN,
  SUCCESS_USERREMOVE,
  INVALID_USERID,
  INVALID_PASSWORD,
  INVALID_USERNAME,
} = require('../config/string');

async function register(username, email, password, timezone) {
  try {
    let user = await UserSchema.findOne({ Email: email });
    if (user) return ERROR_USER_EXIST;

    user = await UserSchema.findOne({ Username: username });
    if (user) return ERROR_USER_EXIST;

    const avatar = normalize(
      gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      }),
      { forceHttps: true }
    );

    let permission;
    user = await UserSchema.findOne({ Permission: PERMISSION_ADMIN });
    if (user) permission = PERMISSION_USER;
    else permission = PERMISSION_ADMIN;

    user = new UserSchema({
      Username: username,
      Email: email,
      Avatar: avatar,
      Password: password,
      Timezone: timezone,
      Permission: permission,
    });

    const salt = await bcrypt.genSalt(10);
    user.Password = await bcrypt.hash(password, salt);

    await user.save();
    const payload = {
      user: {
        id: user.id,
      },
    };
    return payload;
  } catch (err) {
    console.error(err.message);
    return ERROR_SERVER;
  }
}

async function login(username, password) {
  try {
    let user = await UserSchema.findOne({ Username: username });
    if (!user) return INVALID_USERNAME;

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) return INVALID_PASSWORD;

    const payload = {
      user: {
        id: user.id,
        email: user.Email,
        username: user.Username,
        avatar: user.Avatar,
        timezone: user.Timezone,
        game_username: user.Game_Username,
      },
    };
    return payload;
  } catch (err) {
    console.error(err.message);
    return ERROR_SERVER;
  }
}

async function getUserById(id) {
  try {
    const user = await UserSchema.findById(id).select('-password');
    if (!user) return INVALID_USERID;

    const payload = {
      user: {
        id: user.id,
        email: user.Email,
        username: user.Username,
        avatar: user.Avatar,
        timezone: user.Timezone,
        game_username: user.Game_Username,
      },
    };
    return payload;
  } catch (err) {
    console.error('getUserInfoById error: ', err.message);
    return INVALID_USERID;
  }
}

async function removeUserbyID(id) {
  try {
    const user = await UserSchema.findById(id);
    if (!user) return INVALID_USERID;

    await user.remove();
    return SUCCESS_USERREMOVE;
  } catch (err) {
    console.error('removeUserbyID error: ', err.message);
    return INVALID_USERID;
  }
}

module.exports = {
  register,
  login,
  getUserById,
  removeUserbyID,
};