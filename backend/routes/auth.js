const express = require("express");
const User = require("../models/User");
const Student = require("../models/Student"); // Import the Student model
const jwt = require("jsonwebtoken");
const router = express.Router();

// User login
router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ username, role });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the password matches (plaintext comparison)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // If the user is a student, fetch the student data
    if (user.role === "student") {
      const student = await Student.findOne({ name: username }); // Find the student by name (or another unique field)
      if (!student) {
        return res.status(404).json({ error: "Student data not found" });
      }

      // Return the user's role, studentId, and token
      return res.json({
        token,
        role: user.role,
        studentId: student._id, // Return the student's _id
        isAuthenticated: true
      });
    }

    // For teachers, return role and token
    res.json({ 
      token,
      role: user.role,
      isAuthenticated: true
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Check authentication status
router.get("/check-auth", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.json({ isAuthenticated: false });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      res.json({ 
        isAuthenticated: true,
        user: decoded
      });
    } catch (err) {
      res.json({ isAuthenticated: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
