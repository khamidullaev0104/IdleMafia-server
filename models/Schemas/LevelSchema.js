const mongoose = require('mongoose');

const LevelSchema = new mongoose.Schema({
  Datas: [
    {
      name: {
        type: String,
        required: true,
      },
      members: [
        {
          name: {
            type: String,
            required: true,
          },
          img: {
            type: String,
            required: true,
          },
          fp: {
            type: String,
            required: true,
          },
        },
      ],
      tfp: {
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

module.exports = mongoose.model('Level', LevelSchema);
