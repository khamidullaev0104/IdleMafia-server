const gravatar = require('gravatar');
const normalize = require('normalize-url');
const bcrypt = require('bcryptjs');

const User = require('../models/Schemas/UserSchema');

async function register(username, email, password) {
  try {
    let user = await User.findOne({ email });

    if (user) {
      return 'User already exists';
    }

    const avatar = normalize(
      gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      }),
      { forceHttps: true }
    );

    user = new User({
      Username: username,
      Email: email,
      Avatar: avatar,
      Password: password,
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
    return err.message;
  }
}

module.exports = register;
