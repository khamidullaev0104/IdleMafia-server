const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
    unique: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Timezone: {
    type: String,
    required: true,
  },
  Permission: {
    type: String,
    required: true,
  },
  Game_Username: {
    type: String,
  },
  Avatar: {
    type: String,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
  Allow: {
    type: String,
    default: 'false',
  },
  PasswordChangeRequire: {
    type: String,
    default: 'false',
  },
});

module.exports = mongoose.model('user', UserSchema);
