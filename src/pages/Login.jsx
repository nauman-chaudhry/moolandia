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
        const response = await axios.get("https://moolandia-mern-app.onrender.com/api/season-images");
        if (response.data.success && response.data.images.length > 0) {
          // Look for an image flagged as background; otherwise, default to the first image
          const bgImage =
            response.data.images.find((img) => img.isBackground) ||
            response.data.images[0];
          const imageUrl = `https://moolandia-mern-app.onrender.com${bgImage.path || bgImage.imagePath}`;
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
    buttonClickSound.play();

    // Basic validation
    if (!username || !password) {
      setError("Please enter both username and password.");
      errorSound.play(); // Play error sound
      return;
    }

    try {
      console.log("Attempting login with:", { username, password, role });
      const response = await fetch("https://moolandia-mern-app.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok) {
        // Store authentication data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userType", data.role);
        if (data.studentId) {
          localStorage.setItem("userId", data.studentId);
        }

        successSound.play(); // Play success sound
        
        // Navigate based on role
        if (role === "teacher") {
          navigate("/teacher-dashboard");
        } else if (role === "student" && data.studentId) {
          navigate(`/student/${data.studentId}/dashboard`);
        } else {
          setError("Invalid role or missing student ID");
          errorSound.play(); // Play error sound
        }
      } else {
        setError(data.error || "Login failed");
        errorSound.play(); // Play error sound
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      errorSound.play(); // Play error sound
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: bg ? `url(${bg})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mb-4 sm:mb-8 w-full max-w-[200px] sm:max-w-[300px]"
      >
        <img src={logo} alt="Game Logo" className="w-full" />
      </motion.div>

      {/* Role Selection or Login Form */}
      {!role ? (
        // Role Selection Buttons
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-lg"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 sm:mb-8">
            Select Your Role
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelection("teacher")}
              className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-yellow-500 text-white text-lg sm:text-xl font-bold rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
            >
              🧑‍🏫 Teacher
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelection("student")}
              className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-green-500 text-white text-lg sm:text-xl font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors"
            >
              👩‍🎓 Student
            </motion.button>
          </div>
        </motion.div>
      ) : (
        // Login Form with Transparent Background
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-lg"
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
            className="text-2xl sm:text-3xl font-bold mb-6 text-center text-yellow-400"
            style={{
              textShadow: "0 0 10px rgba(255, 223, 0, 0.8)",
              fontFamily: "'Cinzel', serif",
            }}
          >
            {role === "teacher" ? "Teacher Login" : "Student Login"}
          </h2>
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            {/* Username Input */}
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-black/50 text-white placeholder-gray-300 rounded-full border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 text-base sm:text-lg"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-black/50 text-white placeholder-gray-300 rounded-full border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 text-base sm:text-lg"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-red-400 text-center text-sm sm:text-base"
              >
                {error}
              </motion.p>
            )}

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full px-6 py-3 sm:px-8 sm:py-4 bg-yellow-500 text-white text-lg sm:text-xl font-bold rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
            >
              Login
            </motion.button>

            {/* Back Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRole(null)}
              className="w-full px-4 py-2 text-yellow-400 hover:text-yellow-300 text-center text-sm sm:text-base"
            >
              ← Back to Role Selection
            </motion.button>
          </form>
        </motion.div>
      )}
    </div>
  );
}

export default Login;
