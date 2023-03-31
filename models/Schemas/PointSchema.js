const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
  Datas: [
    {
      name: {
        type: String,
        required: true,
      },
      dayPoints: {
        type: String,
        required: true,
      },
      weekPoints: {
        type: String,
        required: true,
      },
    },
  ],
  Date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Point', PointSchema);
