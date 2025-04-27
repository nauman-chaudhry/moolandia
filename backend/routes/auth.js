const express = require("express");
const User = require("../models/User");
const Student = require("../models/Student"); // Import the Student model
const router = express.Router();

// User login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the password matches (plaintext comparison)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // If the user is a student, fetch the student data
    if (user.role === "student") {
      const student = await Student.findOne({ name: username }); // Find the student by name (or another unique field)
      if (!student) {
        return res.status(404).json({ error: "Student data not found" });
      }

      // Return the user's role and studentId
      return res.json({
        role: user.role,
        studentId: student._id, // Return the student's _id
        isAuthenticated: true
      });
    }

    // For teachers, just return the role
    res.json({ 
      role: user.role,
      isAuthenticated: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check authentication status
router.get("/check-auth", async (req, res) => {
  try {
    // For now, we'll just return false since we're not using sessions
    // In a real application, you would check for a valid session or token here
    res.json({ isAuthenticated: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
