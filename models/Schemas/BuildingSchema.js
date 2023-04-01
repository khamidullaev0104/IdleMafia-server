const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({
  Datas: {
    your: [
      {
        name: {
          type: String,
        },
        status: {
          type: String,
        },
        team: {
          type: String,
        },
        capo: {
          type: String,
        },
        tfp: {
          type: String,
        },
      },
    ],
    enemy: [
      {
        name: {
          type: String,
        },
        status: {
          type: String,
        },
        team: {
          type: String,
        },
        capo: {
          type: String,
        },
        tfp: {
          type: String,
        },
      },
    ],
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Building', BuildingSchema);
