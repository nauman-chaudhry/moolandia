const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Reference to the Student model
    },
  ], // Array of student references
});

// Check if the model is already defined
const Class = mongoose.models.Class || mongoose.model("Class", ClassSchema);

module.exports = Class;