const gravatar = require('gravatar');
const normalize = require('normalize-url');
const bcrypt = require('bcryptjs');

const UserSchema = require('../models/Schemas/UserSchema');
const {
  ERROR_USER_EXIST,
  ERROR_SERVER,
  ERROR_USER_NOTALLOW,
  PERMISSION_USER,
  PERMISSION_ADMIN,
  SUCCESS_USERREMOVE,
  INVALID_USERID,
  INVALID_PASSWORD,
  INVALID_USERNAME,
  INVALID_CURRENTPASSWORD,
  INVALID_NEWPASSWORD_DIFFERENCE,
  INVALID_CURRENTPASSWORD_SMALL,
  ALLOW,
  NOTALLOW,
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
    let allow;
    user = await UserSchema.findOne({ Permission: PERMISSION_ADMIN });
    if (user) {
      permission = PERMISSION_USER;
      allow = NOTALLOW;
    } else {
      permission = PERMISSION_ADMIN;
      allow = ALLOW;
    }

    user = new UserSchema({
      Username: username,
      Email: email,
      Avatar: avatar,
      Password: password,
      Timezone: timezone,
      Permission: permission,
      Allow: allow,
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

    if (user.Allow === 'false') return ERROR_USER_NOTALLOW;

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
        permission: user.Permission,
      },
    };
    return payload;
  } catch (err) {
    console.error('getUserById error: ', err.message);
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

async function changeUserInfo(info) {
  try {
    let user = await UserSchema.findById(info.userId);
    if (!user) return INVALID_USERID;
    user.Username = info.username;
    user.Email = info.email;
    user.Game_Username = info.gangName;

    if (info.isPasswordChange) {
      const isMatch = await bcrypt.compare(info.currentPassword, user.Password);
      if (!isMatch) return INVALID_CURRENTPASSWORD;
      if (info.newPassword !== info.confirmPassword)
        return INVALID_NEWPASSWORD_DIFFERENCE;
      if (info.newPassword.length > 6) return INVALID_CURRENTPASSWORD_SMALL;
      const salt = await bcrypt.genSalt(10);
      user.Password = await bcrypt.hash(info.newPassword, salt);
    }

    return await user.save();
  } catch (err) {
    console.error('changeUserInfo: ', err.message);
    return INVALID_USERID;
  }
}

async function resetPassword(id, password) {
  try {
    let user = await UserSchema.findById(id);
    if (!user) return INVALID_USERID;

    const salt = await bcrypt.genSalt(10);
    user.Password = await bcrypt.hash(password, salt);

    return await user.save();
  } catch (err) {
    console.error('resetPassword: ', err.message);
    return INVALID_USERID;
  }
}

async function setPermission(id, permission) {
  try {
    let user = await UserSchema.findById(id);
    if (!user) return INVALID_USERID;

    switch (permission) {
      case PERMISSION_USER:
        user.Permission = PERMISSION_USER;
        break;
      case PERMISSION_ADMIN:
        user.Permission = PERMISSION_ADMIN;
        break;
      default:
        user.Permission = PERMISSION_USER;
    }

    return await user.save();
  } catch (err) {
    console.error('setPermission: ', err.message);
    return INVALID_USERID;
  }
}

async function setAllow(id, allow) {
  try {
    let user = await UserSchema.findById(id);
    if (!user) return INVALID_USERID;

    user.Allow = allow;

    return await user.save();
  } catch (err) {
    console.error('setAllow: ', err.message);
    return INVALID_USERID;
  }
}

async function isAdmin(id) {
  try {
    let user = await UserSchema.findById(id);
    if (!user) return INVALID_USERID;

    return user.Permission;
  } catch (err) {
    console.error('setAllow: ', err.message);
    return INVALID_USERID;
  }
}

module.exports = {
  register,
  login,
  getUserById,
  changeUserInfo,
  removeUserbyID,
  resetPassword,
  setPermission,
  setAllow,
  isAdmin,
};
