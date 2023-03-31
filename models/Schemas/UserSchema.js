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
  Avatar: {
    type: String,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('user', UserSchema);
