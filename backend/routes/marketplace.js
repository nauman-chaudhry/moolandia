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

router.post("/:id/purchase", async (req, res) => {
  const { studentId } = req.body;

  try {
    const item = await Marketplace.findById(req.params.id);
    const student = await Student.findById(studentId);

    if (!item || !student) {
      return res.status(404).json({ error: "Item or Student not found" });
    }

    if (student.balance < item.price) {
      return res.status(400).json({ error: "Not enough balance" });
    }

    // Deduct the price from the student's balance
    student.balance -= item.price;

    // If the item is a cow icon, update the student's cowIcon field
    if (item.category === "cow") {
      student.cowIcon = item.iconUrl;
    }

    await student.save();

    // Create a transaction for the purchase
    const transaction = new Transaction({
      student: studentId,
      type: "Spent",
      amount: item.price,
      description: `Purchased ${item.category === "cow" ? "cow icon" : "item"}: ${item.name}`,
    });
    await transaction.save();

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await Marketplace.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;