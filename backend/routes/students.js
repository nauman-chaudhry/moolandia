const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Task = require("../models/Task"); // Add this import
const Marketplace = require("../models/Marketplace"); // Add this import
const Class = require("../models/Class");
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

router.put("/:id/updateLevel", async (req, res) => {
  const { level, completedTasks } = req.body;
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { level, completedTasks },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    console.error("Error updating level:", err);
    res.status(500).json({ error: "Failed to update level" });
  }
});
// Apply a fine to a student
router.put("/:id/fine", async (req, res) => {
  const { amount } = req.body;

  try {
    // Validate the amount
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid fine amount. Amount must be a positive number." });
    }

    // Find the student
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check for insufficient balance
    if (student.balance - amount < 0) {
      return res.status(400).json({ error: "Insufficient balance to apply the fine." });
    }

    // Deduct the fine amount from the student's balance
    student.balance -= amount;
    await student.save();

    // Log the fine application (optional)
    const transaction = new Transaction({
      student: student._id,
      type: "Fine",
      amount: amount,
      description: `Fine applied: ${amount} Moolah`,
    });
    await transaction.save();

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
      cowIcon: student.cowIcon, // Include cow icon
      level: student.level, // Include level
      completedTasks: student.completedTasks, // Include completed tasks
      tasks,
      transactions,
      marketplaceItems,
      class: student.class,
    });
  } catch (err) {
    console.error("Error in /api/students/:id/dashboard:", err);
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

router.put("/:id/updateIcon", async (req, res) => {
  const { cowIcon } = req.body; // The new cow icon URL or identifier
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id, // Student ID from the URL
      { cowIcon }, // Update the cowIcon field
      { new: true } // Return the updated student
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student); // Return the updated student
  } catch (err) {
    console.error("Error updating cow icon:", err);
    res.status(500).json({ error: "Failed to update cow icon" });
  }
});

router.put("/:id/updateClass", async (req, res) => {
  const { classId } = req.body;
  const studentId = req.params.id;

  try {
    // Validate studentId and classId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }
    if (classId && !mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ error: "Invalid class ID" });
    }

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // If the student is already in a class, remove them from that class
    if (student.class) {
      await Class.findByIdAndUpdate(
        student.class,
        { $pull: { students: studentId } },
        { new: true }
      );
    }

    // Update the student's class
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { class: classId },
      { new: true }
    ).populate("class");


    // Add the student to the new class
    if (classId) {
      await Class.findByIdAndUpdate(
        classId,
        { $addToSet: { students: studentId } },
        { new: true }
      );
    }

    res.json(updatedStudent);
  } catch (err) {
    console.error("Error updating student class:", err);
    res.status(500).json({ error: "Failed to update student class" });
  }
});

router.get("/report/balances", async (req, res) => {
  try {
    const students = await Student.find().populate('class', 'name');
    const reportData = students.map(student => ({
      name: student.name,
      class: student.class?.name || 'Unassigned',
      balance: student.balance,
      level: student.level,
      completedTasks: student.completedTasks
    }));
    
    res.json(reportData);
  } catch (err) {
    console.error("Error generating balances report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

module.exports = router;