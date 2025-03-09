const express = require("express");
const Student = require("../models/Student");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Task = require("../models/Task"); // Add this import
const Marketplace = require("../models/Marketplace"); // Add this import
const router = express.Router();

// Fetch all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new student
router.post("/", async (req, res) => {
  const { name, password } = req.body; // Add password to the request body

  try {
    // Create the student
    const newStudent = new Student({ name });
    await newStudent.save();

    // Create a corresponding user in the User collection
    const newUser = new User({
      username: name, // Use the student's name as the username
      password, // Store the password (plaintext)
      role: "student",
    });
    await newUser.save();

    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a student's balance (e.g., apply fine or reward)
router.put("/:id/balance", async (req, res) => {
  const { amount } = req.body;

  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.balance += amount; // Add or subtract the amount
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Apply a fine to a student
router.put("/:id/fine", async (req, res) => {
  const { amount } = req.body;

  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Deduct the fine amount from the student's balance
    student.balance -= amount;
    await student.save();

    res.json(student);
  } catch (err) {
    console.error("Error applying fine:", err);
    res.status(500).json({ error: "Failed to apply fine", details: err.message });
  }
});

// Fetch student-specific data
router.get("/:id/dashboard", async (req, res) => {
  const studentId = req.params.id;

  try {
    // Fetch the student's balance and icon
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Fetch tasks assigned to the student
    const tasks = await Task.find({ assignedTo: studentId });

    // Fetch transactions for the student
    const transactions = await Transaction.find({ student: studentId });

    // Fetch marketplace items (same for all students)
    const marketplaceItems = await Marketplace.find();

    res.json({
      balance: student.balance,
      icon: student.icon,
      tasks,
      transactions,
      marketplaceItems,
    });
  } catch (err) {
    console.error("Error in /api/students/:id/dashboard:", err); // Log the error
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

// Delete a student
router.delete("/:id", async (req, res) => {
  const studentId = req.params.id;

  try {
    // Delete the student
    const deletedStudent = await Student.findByIdAndDelete(studentId);
    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Delete the corresponding user (if applicable)
    await User.findOneAndDelete({ username: deletedStudent.name });

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

module.exports = router;