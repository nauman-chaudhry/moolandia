import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Howl } from "howler";
import backgroundImage from "./background2@2x.png";
import logo from "./LogoColor.png";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // Track selected role (teacher or student)
  const [username, setUsername] = useState(""); // Track username input
  const [password, setPassword] = useState(""); // Track password input
  const [error, setError] = useState(""); // Track login errors

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
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
      >
        <img src={logo} alt="Game Logo" className="w-30" />
      </motion.div>

      {/* Role Selection or Login Form */}
      {!role ? (
        // Role Selection Buttons
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRoleSelection("teacher")}
            className="game-button bg-yellow-500 text-white text-xl font-bold px-10 py-4 rounded-full shadow-lg relative"
          >
            🧑‍🏫 Teacher
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRoleSelection("student")}
            className="game-button bg-green-500 text-white text-xl font-bold px-10 py-4 rounded-full shadow-lg relative"
          >
            👩‍🎓 Student
          </motion.button>
        </motion.div>
      ) : (
        // Game-Like Login Form
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="bg-black/50 p-8 rounded-3xl shadow-lg backdrop-blur-sm border-2 border-yellow-400 relative"
          style={{
            boxShadow: "0 0 20px rgba(255, 223, 0, 0.5)",
          }}
        >
          {/* Glowing Effect */}
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
                className="w-full p-6 rounded-full bg-black/50 text-white placeholder-gray-400 border-2 border-yellow-400 focus:outline-none focus:border-yellow-500"
                style={{
                  boxShadow: "0 0 10px rgba(255, 223, 0, 0.5)",
                  fontSize: "1.5rem",
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
                className="w-full p-6 rounded-full bg-black/50 text-white placeholder-gray-400 border-2 border-yellow-400 focus:outline-none focus:border-yellow-500"
                style={{
                  boxShadow: "0 0 10px rgba(255, 223, 0, 0.5)",
                  fontSize: "1.5rem",
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
            className="mt-4 text-sm text-yellow-400 hover:text-yellow-300 text-center w-full"
            style={{
              textShadow: "0 0 5px rgba(255, 223, 0, 0.8)",
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