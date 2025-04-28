import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Howl } from "howler";
import axios from "axios";
import logo from "./LogoColor.png";
import coinImage from "./coin.png";

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // Track selected role (teacher or student)
  const [username, setUsername] = useState(""); // Track username input
  const [password, setPassword] = useState(""); // Track password input
  const [error, setError] = useState(""); // Track login errors
  const [bg, setBg] = useState(null); // State to hold the background image URL
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://moolandia-mern-app.onrender.com';

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!username || !password) {
      setError("Please enter both username and password.");
      errorSound.play();
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", { username, role });
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok) {
        if (data.role === role) {
          successSound.play();
          
          // Store authentication data
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          if (data.studentId) {
            localStorage.setItem('studentId', data.studentId);
          }

          // Set authentication state
          setIsAuthenticated(true);

          // Navigate to appropriate dashboard
          if (role === "teacher") {
            navigate("/teacher-dashboard", { replace: true });
          } else if (role === "student") {
            navigate(`/student/${data.studentId}/dashboard`, { replace: true });
          }
        } else {
          setError("Invalid role for this user.");
          errorSound.play();
        }
      } else {
        console.error("Login failed:", data.error);
        setError(data.error || "Login failed. Please check your credentials.");
        errorSound.play();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      errorSound.play();
    } finally {
      setIsLoading(false);
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
        padding: "1rem",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
          margin: "auto",
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ 
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "1rem 0",
          }}
        >
          <img 
            src={logo}
            alt="Game Logo" 
            style={{ 
              width: isMobile ? "180px" : "250px",
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </motion.div>

        {/* Role Selection or Login Form */}
        {!role ? (
          // Role Selection Buttons
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center gap-6"
            style={{ 
              width: "100%",
              maxWidth: "400px",
              padding: "0 1rem",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRoleSelection("teacher")}
              className="game-button bg-yellow-500 text-white text-xl font-bold px-10 py-4 rounded-full shadow-lg relative"
              style={{ 
                width: "100%",
                maxWidth: "300px",
              }}
            >
              🧑‍🏫 Teacher
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRoleSelection("student")}
              className="game-button bg-green-500 text-white text-xl font-bold px-10 py-4 rounded-full shadow-lg relative"
              style={{ 
                width: "100%",
                maxWidth: "300px",
              }}
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
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto",
              padding: isMobile ? "1.5rem" : "2rem",
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
                fontSize: isMobile ? "1.8rem" : "2rem",
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
                  className="w-full p-4 rounded-full bg-black/50 text-white placeholder-gray-400 border-2 border-yellow-400 focus:outline-none focus:border-yellow-500"
                  style={{
                    boxShadow: "0 0 10px rgba(255, 223, 0, 0.5)",
                    fontSize: isMobile ? "1rem" : "1.2rem",
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
                  className="w-full p-4 rounded-full bg-black/50 text-white placeholder-gray-400 border-2 border-yellow-400 focus:outline-none focus:border-yellow-500"
                  style={{
                    boxShadow: "0 0 10px rgba(255, 223, 0, 0.5)",
                    fontSize: isMobile ? "1rem" : "1.2rem",
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
                  className="text-red-500 text-sm text-center"
                  style={{
                    textShadow: "0 0 5px rgba(255, 0, 0, 0.8)",
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
                className="game-button bg-yellow-500 text-white text-xl font-bold px-10 py-4 rounded-full shadow-lg relative"
                style={{
                  boxShadow: "0 0 20px rgba(255, 223, 0, 0.8)",
                  width: "100%",
                  fontSize: isMobile ? "1rem" : "1.2rem",
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </motion.button>
            </form>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRole(null)}
              className="mt-4 text-sm text-yellow-400 hover:text-yellow-300 text-center w-full"
              style={{
                textShadow: "0 0 5px rgba(255, 223, 0, 0.8)",
                fontSize: isMobile ? "0.9rem" : "1rem",
              }}
            >
              ← Back to Role Selection
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Login;
