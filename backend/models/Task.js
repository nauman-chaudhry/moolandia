const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  reward: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ["Academic", "Behavior", "Community"], 
    required: true 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  completed: { type: Boolean, default: false },
  status: { type: String, enum: ["nan", "pending", "completed", "approved", "rejected"], default: "nan" },
  teacherComment: { type: String, default: "" }, // Add a field for teacher's comment
});

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

module.exports = Task;
