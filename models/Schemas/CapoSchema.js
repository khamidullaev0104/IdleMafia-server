const mongoose = require('mongoose');

const CapoSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: false,
    unique: false,
  },
  Image_url: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('capo', CapoSchema);
