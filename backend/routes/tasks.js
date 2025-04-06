const express = require("express");
const Task = require("../models/Task");
const Student = require("../models/Student");
const LevelConfig = require("../models/LevelConfig");
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
// Assign a task to multiple students
router.put("/:id/assign", async (req, res) => {
  const { studentIds } = req.body; // Expect an array of student IDs

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Create a new task for each student
    const assignedTasks = await Promise.all(
      studentIds.map(async (studentId) => {
        const student = await Student.findById(studentId);
        if (!student) {
          throw new Error(`Student with ID ${studentId} not found`);
        }

        // Create a new task instance for each student
        const newTask = new Task({
          name: task.name,
          reward: task.reward,
          assignedTo: studentId,
          status: "nan", // Reset status to "not assigned"
        });

        await newTask.save();
        return newTask;
      })
    );

    res.json(assignedTasks);
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
// Update the approve task endpoint in tasks.js
router.put("/:id/approve", async (req, res) => {
  const { status, comment } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    const student = await Student.findById(task.assignedTo);

    if (!task || !student) {
      return res.status(404).json({ error: "Task or Student not found" });
    }

    task.status = status;
    task.teacherComment = comment || "";

    if (status === "approved") {
      // Add reward to the student's balance
      student.balance += task.reward;
      student.completedTasks += 1;

      // Get level configuration
      const levelConfig = await LevelConfig.findOne({ level: student.level });
      if (!levelConfig) {
        return res.status(500).json({ error: "Level configuration not found" });
      }

      // Check if student has completed required tasks for current level
      if (student.completedTasks >= levelConfig.tasksRequired) {
        student.level += 1;
        student.completedTasks = 0;

        // Get reward for next level
        const nextLevelConfig = await LevelConfig.findOne({ level: student.level });
        if (nextLevelConfig) {
          student.balance += nextLevelConfig.reward;
          
          await axios.post(`${process.env.BASE_URL}/api/transactions`, {
            student: task.assignedTo,
            type: "Earned",
            amount: nextLevelConfig.reward,
            description: `Level ${student.level} completion reward: ${nextLevelConfig.description}`,
          });
        }
      }

      await student.save();

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