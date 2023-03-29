const mongoose = require('mongoose');

const AttackSchema = new mongoose.Schema({
  Datas: [{
    name: {
      type: String,
      required: true
    },
    attack: {
      type: String,
      required: true,
    },
    defense: {
      type: String,
      required: true
    }
  }],
  Date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attack', AttackSchema);
