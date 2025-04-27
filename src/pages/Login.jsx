import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Howl } from "howler";
import axios from "axios";
import logo from "./LogoColor.png";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // Track selected role (teacher or student)
  const [username, setUsername] = useState(""); // Track username input
  const [password, setPassword] = useState(""); // Track password input
  const [error, setError] = useState(""); // Track login errors
  const [bg, setBg] = useState(null); // State to hold the background image URL

  // Sound effects
  const [buttonClickSound] = useState(
    new Howl({
      src: ["https://www.soundjay.com/buttons/button-3.mp3"],
      volume: 0.5,
    })
  );

  const [successSound] = useState(
    new Howl({
      src: ["https://www.soundjay.com/misc/success-bell-ding-1.mp3"],
      volume: 0.5,
    })
  );

  const [errorSound] = useState(
    new Howl({
      src: ["https://www.soundjay.com/misc/fail-buzzer-02.mp3"],
      volume: 0.5,
    })
  );

  // Fetch background image from the backend on component mount
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/season-images");
        if (response.data.success && response.data.images.length > 0) {
          // Look for an image flagged as background; otherwise, default to the first image
          const bgImage =
            response.data.images.find((img) => img.isBackground) ||
            response.data.images[0];
          const imageUrl = `http://localhost:5000${bgImage.path || bgImage.imagePath}`;
          setBg(imageUrl);
        }
      } catch (err) {
        console.error("Error fetching background image:", err);
      }
    };

    fetchBackgroundImage();
  }, []);

  // Handle role selection
  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    setError(""); // Clear any previous errors
    buttonClickSound.play(); // Play button click sound
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!username || !password) {
      setError("Please enter both username and password.");
      errorSound.play(); // Play error sound
      return;
    }

    try {
      // Send login request to the backend
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if the user's role matches the selected role
        if (data.role === role) {
          successSound.play(); // Play success sound

          // Navigate to the appropriate dashboard
          if (role === "teacher") {
            navigate("/teacher-dashboard");
          } else if (role === "student") {
            const studentId = data.studentId; // Use the studentId returned from the backend
            navigate(`/student/${studentId}/dashboard`); // Navigate to the student dashboard with the studentId
          }
        } else {
          setError("Invalid role for this user.");
          errorSound.play(); // Play error sound
        }
      } else {
        setError(data.error || "Login failed");
        errorSound.play(); // Play error sound
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      errorSound.play(); // Play error sound
    }
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: bg ? `url(${bg})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        height: "100vh",
        width: "100vw",
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mb-8"
        style={{ paddingLeft: "250px", paddingTop: "150px" }}
      >
        <img src={logo} alt="Game Logo" className="w-30 ml-4" />
      </motion.div>

      {/* Role Selection or Login Form */}
      {!role ? (
        // Role Selection Buttons
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center gap-6"
          style={{ paddingLeft: "710px"  }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRoleSelection("teacher")}
            className="game-button bg-yellow-500 text-white text-xl font-bold px-10 py-4 rounded-full shadow-lg relative ml-4"
          >
            🧑‍🏫 Teacher
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRoleSelection("student")}
            className="game-button bg-green-500 text-white text-xl font-bold px-10 py-4 rounded-full shadow-lg relative ml-4 marginleftclass"
            style={{ marginLeft: "50px" }}
          >
            👩‍🎓 Student
          </motion.button>
        </motion.div>
      ) : (
        // Login Form with Transparent Background
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="bg-transparent p-8 rounded-3xl shadow-lg border-2 border-yellow-400 relative"
          style={{
            boxShadow: "0 0 20px rgba(255, 223, 0, 0.5)",
          }}
        >
          {/* Optional Glowing Effect */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "radial-gradient(circle, rgba(255, 223, 0, 0.3), transparent 70%)",
              filter: "blur(10px)",
              zIndex: -1,
            }}
          ></div>

          <h2
            className="text-3xl font-bold mb-6 text-center text-yellow-400"
            style={{
              textShadow: "0 0 10px rgba(255, 223, 0, 0.8)",
              fontFamily: "'Cinzel', serif",
            }}
          >
            {role === "teacher" ? "Teacher Login" : "Student Login"}
          </h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {/* Username Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-6 rounded-full bg-black/50 text-white placeholder-gray-400 border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 marginleftclass"
                style={{
                  boxShadow: "0 0 10px rgba(255, 223, 0, 0.5)",
                  fontSize: "1.5rem",
                  marginTop:"10px",
              marginLeft:"690px"
                }}
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-6 rounded-full bg-black/50 text-white placeholder-gray-400 border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 marginleftclass"
                style={{
                  boxShadow: "0 0 10px rgba(255, 223, 0, 0.5)",
                  fontSize: "1.5rem",
                  marginTop:"10px",
              marginLeft:"690px"
                }}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-red-500 text-sm text-center marginleftclass"
                style={{
                  textShadow: "0 0 5px rgba(255, 0, 0, 0.8)",
                  marginTop:"10px",
              marginLeft:"730px"
                }}
              >
                {error}
              </motion.p>
            )}

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="submit"
              className="game-button bg-yellow-500 text-white text-xl font-bold px-10 py-4 rounded-full shadow-lg relative marginleftclass"
              style={{
                boxShadow: "0 0 20px rgba(255, 223, 0, 0.8)",
                marginTop:"10px",
                marginLeft:"800px"
              }}
            >
              Login
            </motion.button>
          </form>

          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setRole(null)}
            className="mt-4 text-sm text-yellow-400 hover:text-yellow-300 text-center w-full marginleftclass"
            style={{
              textShadow: "0 0 5px rgba(255, 223, 0, 0.8)",
              marginTop:"10px",
              marginLeft:"730px"
            }}
          >
            ← Back to Role Selection
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

export default Login;
