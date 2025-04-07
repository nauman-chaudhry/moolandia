const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        callback(null, true);
    },
    credentials: true,
}));
app.use(express.json());
// Serve static files from the assets folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { 
    // Additional options if needed
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/students", require("./routes/students"));
app.use("/api/marketplace", require("./routes/marketplace"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/classes", require("./routes/classes"));
app.use("/api/levelConfig", require("./routes/levelConfig"));
app.use("/api/season-images", require("./routes/seasonImages"));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
