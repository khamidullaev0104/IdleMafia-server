const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({
  your: [
    {
      name: {
        type: String,
        required: true,
      },
      status: {
        type: Boolean,
        required: true,
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
        required: true,
      },
      status: {
        type: Boolean,
        required: true,
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
  Date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Building', BuildingSchema);
