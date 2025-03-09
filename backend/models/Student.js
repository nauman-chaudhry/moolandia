const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  balance: { type: Number, default: 0 },
  icon: { type: String, default: "🐮" },
  level: { type: Number, default: 1 },
});

// Check if the model is already defined
const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

module.exports = Student;