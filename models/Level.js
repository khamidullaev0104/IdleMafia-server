const mongoose = require('mongoose');

const LevelSchema = new mongoose.Schema({
  Datas: [
    {
      name: {
        type: String,
        required: true,
      },
      gang_member: [
        {
          Name: {
            type: String,
            required: true,
          },
          Url: {
            type: String,
            required: true,
          },
          Fp: {
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
