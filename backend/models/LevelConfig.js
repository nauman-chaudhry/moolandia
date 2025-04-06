// models/LevelConfig.js
const mongoose = require("mongoose");

const LevelConfigSchema = new mongoose.Schema({
  level: { type: Number, required: true, unique: true },
  tasksRequired: { type: Number, required: true },
  reward: { type: Number, required: true },
  description: { type: String, required: true },
});

const LevelConfig = mongoose.models.LevelConfig || mongoose.model("LevelConfig", LevelConfigSchema);

module.exports = LevelConfig;