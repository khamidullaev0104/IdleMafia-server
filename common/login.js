const bcrypt = require('bcryptjs');

const UserSchema = require('../models/Schemas/UserSchema');

async function login(username, password) {
  try {
    let user = await UserSchema.findOne({ Username: username });

    if (!user) {
      return 'Invalid Credentials-Username can not found';
    }
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return 'Invalid Credentials-Password different';
    }

    const payload = {
      user: {
        id: user.id,
        email: user.Email,
        username: user.Username,
        avatar: user.Avatar,
      },
    };

    return payload;
  } catch (err) {
    console.error(err.message);
    return 'Server error';
  }
}

module.exports = login;
