const express = require("express");
const Task = require("../models/Task");
const Student = require("../models/Student");
const router = express.Router();
const axios = require("axios");

// Create a new task
router.post("/", async (req, res) => {
  const { name, reward } = req.body;

  try {
    const newTask = new Task({ name, reward });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo"); // Populate the assignedTo field with student details
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch pending tasks (tasks marked as completed by students but not yet approved by the teacher)
router.get("/pending", async (req, res) => {
  try {
    const pendingTasks = await Task.find({ status: "pending" }).populate("assignedTo");
    res.json(pendingTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign a task to a student
router.put("/:id/assign", async (req, res) => {
  const { studentId } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    const student = await Student.findById(studentId);

    if (!task || !student) {
      return res.status(404).json({ error: "Task or Student not found" });
    }

    task.assignedTo = studentId;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a task as completed (student action)
router.put("/:id/complete", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const student = await Student.findById(task.assignedTo);

    if (!task || !student) {
      return res.status(404).json({ error: "Task or Student not found" });
    }

    task.completed = true;
    task.status = "pending"; // Set status to pending for teacher approval
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve or reject a task (teacher action)
router.put("/:id/approve", async (req, res) => {
  const { status, comment } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    const student = await Student.findById(task.assignedTo);

    if (!task || !student) {
      return res.status(404).json({ error: "Task or Student not found" });
    }

    task.status = status; // Set status to approved or rejected
    task.teacherComment = comment || ""; // Add teacher's comment

    if (status === "approved") {
      // Add reward to the student's balance
      student.balance += task.reward;
      await student.save();

      // Create a transaction for the reward using axios
      await axios.post(`${process.env.BASE_URL}/api/transactions`, {
        student: task.assignedTo,
        type: "Earned",
        amount: task.reward,
        description: `Completed task: ${task.name}`,
      });
    }

    await task.save();
    res.json(task);
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(500).json({ error: "Failed to update task status", details: err.message });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  const taskId = req.params.id;

  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;