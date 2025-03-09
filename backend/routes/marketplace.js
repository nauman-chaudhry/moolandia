const express = require("express");
const Marketplace = require("../models/Marketplace");
const router = express.Router();

// Fetch all marketplace items
router.get("/", async (req, res) => {
  try {
    const items = await Marketplace.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new marketplace item
router.post("/", async (req, res) => {
  const { name, price } = req.body;

  try {
    const newItem = new Marketplace({ name, price });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;