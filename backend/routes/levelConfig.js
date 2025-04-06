// routes/levelConfig.js
const express = require("express");
const LevelConfig = require("../models/LevelConfig");
const router = express.Router();

// Get all level configurations
router.get("/", async (req, res) => {
  try {
    const levels = await LevelConfig.find().sort({ level: 1 });
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a level configuration
router.post("/", async (req, res) => {
  const { level, tasksRequired, reward, description } = req.body;

  try {
    const existingLevel = await LevelConfig.findOne({ level });

    if (existingLevel) {
      // Update existing level
      existingLevel.tasksRequired = tasksRequired;
      existingLevel.reward = reward;
      existingLevel.description = description;
      await existingLevel.save();
      res.json(existingLevel);
    } else {
      // Create new level
      const newLevel = new LevelConfig({
        level,
        tasksRequired,
        reward,
        description,
      });
      await newLevel.save();
      res.status(201).json(newLevel);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a level configuration
router.delete("/:level", async (req, res) => {
  try {
    await LevelConfig.findOneAndDelete({ level: req.params.level });
    res.json({ message: "Level configuration deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;