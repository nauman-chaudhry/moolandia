const mongoose = require('mongoose');

const SeasonImageSchema = new mongoose.Schema({
  imagePath: { type: String, required: true },
  isBackground: { type: Boolean, default: false }
});

module.exports = mongoose.model('SeasonImage', SeasonImageSchema);
