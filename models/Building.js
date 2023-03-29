const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({
  Datas: {
    Your: [{
      Atatus: {
          type: String,
          required: true
      },
      team: {
          type: String,
      },
      capo: {
          type: String,
      },
      tfp_left: {
          type: String,
      },
    }],
    Enemy: [{
      status: {
          type: String,
          required: true
      },
      team: {
          type: String,
      },
      capo: {
          type: String,
      },
      tfp_left: {
          type: String,
      },
    }],
  },
  Date: {
    type: Date,
    default: Date.now
  }
 
});

module.exports = mongoose.model('Building', BuildingSchema);
