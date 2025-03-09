const express = require("express");
const Transaction = require("../models/Transaction");
const router = express.Router();

// Create a new transaction
router.post("/", async (req, res) => {
  const { student, type, amount, description, date, } = req.body;

  try {
    const newTransaction = new Transaction({
      student,
      type,
      amount,
      description,
      date,
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    console.error("Error creating transaction:", err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

module.exports = router;