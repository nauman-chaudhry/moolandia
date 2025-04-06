const express = require("express");
const Class = require("../models/Class");
const Student = require("../models/Student");
const router = express.Router();

// Create a new class
router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const newClass = new Class({ name });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find().populate("students");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific class by ID
router.get("/:id", async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate("students");
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json(classData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a class (add/remove students)
router.put("/:id", async (req, res) => {
  const { students } = req.body;
  try {
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      { students },
      { new: true }
    ).populate("students");
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json(classData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a class
router.delete("/:id", async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:classId/students', async (req, res) => {
  try {
    const classId = req.params.classId;
    const students = await Student.find({ class: classId });
    res.json({ name: "Class Name", students });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students in class" });
  }
});

module.exports = router;