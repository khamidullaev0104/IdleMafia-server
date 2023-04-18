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
  ERROR_USER_INFO,
  NO_USER,
  WARNING_ALREADY_SENT_PASSWORDCHANGEREQUEST,
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
    const user = await UserSchema.findOne({ Username: username });
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
        permission: user.Permission,
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
        discordToken: user.DiscordData?.token,
        permission: user.Permission,
      },
    };
    return payload;
  } catch (err) {
    console.error('getUserById error: ', err.message);
    return INVALID_USERID;
  }
}

async function getUsers() {
  try {
    const users = await UserSchema.find().select('-password');
    if (!users || users.length === 0) return NO_USER;

    return users;
  } catch (err) {
    console.error('getUsers error: ', err.message);
    return ERROR_SERVER;
  }
}

async function getUsersForNotification() {
  try {
    const users = await UserSchema.find({
      PasswordChangeRequire: 'true',
    }).select('-password');
    if (!users || users.length === 0) return NO_USER;

    return users;
  } catch (err) {
    console.error('getUsers error: ', err.message);
    return ERROR_SERVER;
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
    user.DiscordData = {
      token: info.discordToken,
      isActive: true,
    };

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

async function changeUserInfoByAdmin(newUser) {
  try {
    let user = await UserSchema.findById(newUser._id);
    if (!user) return INVALID_USERID;

    switch (newUser.Permission) {
      case PERMISSION_ADMIN:
        user.Permission = PERMISSION_ADMIN;
        break;
      case PERMISSION_USER:
        user.Permission = PERMISSION_USER;
        break;
      default:
        return (
          ERROR_USER_INFO + 'ERROR INFO- Permission: ' + newUser.Permission
        );
    }

    switch (newUser.Allow) {
      case ALLOW:
        user.Allow = ALLOW;
        break;
      case NOTALLOW:
        user.Allow = NOTALLOW;
        break;
      default:
        return ERROR_USER_INFO + 'ERROR INFO- Allow: ' + newUser.Allow;
    }

    if (newUser.Password !== '') {
      user.PasswordChangeRequire = 'false';
      const salt = await bcrypt.genSalt(10);
      user.Password = await bcrypt.hash(newUser.Password, salt);
    }
    return await user.save();
  } catch (err) {
    console.error('changeUserInfoByAdmin: ', err.message);
    return INVALID_USERID;
  }
}

async function getPermission(id) {
  try {
    let user = await UserSchema.findById(id);
    if (!user) return INVALID_USERID;

    return user.Permission;
  } catch (err) {
    console.error('getPermission: ', err.message);
    return INVALID_USERID;
  }
}
async function setPasswordChangeRequest(username) {
  try {
    let user = await UserSchema.findOne({ Username: username });
    if (!user) return INVALID_USERNAME;
    if (user.PasswordChangeRequire === 'true')
      return WARNING_ALREADY_SENT_PASSWORDCHANGEREQUEST;
    user.PasswordChangeRequire = 'true';

    await user.save();
    return true;
  } catch (err) {
    console.error('setPasswordChangeRequest: ', err.message);
    return ERROR_SERVER;
  }
}
module.exports = {
  register,
  login,
  getUserById,
  getUsers,
  getUsersForNotification,
  changeUserInfo,
  removeUserbyID,
  getPermission,
  changeUserInfoByAdmin,
  setPasswordChangeRequest,
};
