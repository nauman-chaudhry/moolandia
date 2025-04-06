// Update Student.js model
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  balance: { type: Number, default: 0 },
  cowIcon: { type: String, default: null },
  level: { type: Number, default: 1 },
  completedTasks: { type: Number, default: 0 },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    default: null,
  },
});

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

module.exports = Student;