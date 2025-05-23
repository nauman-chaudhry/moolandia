import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Howl } from "howler";
import axios from "axios";
import logo from "./LogoColor.png";
import coinImage from "./coin.png"; // Added coin import

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [bg, setBg] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  console.log("API Base URL:", process.env.REACT_APP_API_BASE_URL);

  // Added mobile detection
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

  // Fetch background image
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://moolandia-mern-app.onrender.com';
        const response = await axios.get(`${apiBaseUrl}/api/season-images`);
        if (response.data.success && response.data.images.length > 0) {
          const bgImage = response.data.images.find((img) => img.isBackground) || response.data.images[0];
          const imageUrl = `${apiBaseUrl}${bgImage.path || bgImage.imagePath}`;
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
    setError("");
    buttonClickSound.play();
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter both username and password.");
      errorSound.play();
      return;
    }

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://moolandia-mern-app.onrender.com';
      console.log("API Base URL:", apiBaseUrl);
      
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      console.log("Login response status:", response.status);
      const data = await response.json();
      console.log("Login response data:", data);

      if (response.ok) {
        successSound.play();
        console.log("Login successful, navigating to dashboard...");
        console.log("Role:", role);
        console.log("Student ID:", data.studentId);

        // Store the authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        if (data.studentId) {
          localStorage.setItem('studentId', data.studentId);
        }

        // Set authentication state
        setIsAuthenticated(true);

        if (role === "teacher") {
          console.log("Navigating to teacher dashboard");
          navigate("/teacher-dashboard", { replace: true });
        } else {
          console.log("Navigating to student dashboard");
          navigate(`/student/${data.studentId}/dashboard`, { replace: true });
        }
      } else {
        console.error("Login failed:", data.error);
        setError(data.error || "Login failed");
        errorSound.play();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      errorSound.play();
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
          style={{ 
            paddingLeft: isMobile ? "0" : "250px",
            paddingTop: isMobile ? "6rem" : "250px",
            paddingBottom: isMobile ? "8rem" : "0",
            width: "100%",
            display: "flex",
            justifyContent: isMobile ? "center" : "flex-start"
          }}
        >
          <img 
            src={isMobile ? coinImage : logo}
            alt="Game Logo" 
            style={{ 
              width: isMobile ? "60px" : "auto",
              marginLeft: isMobile ? "0" : "1rem"
            }}
          />
        </motion.div>
  
        {/* Role Selection/Login Content */}
        {!role ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center gap-6"
            style={{ 
              paddingLeft: isMobile ? "0" : "710px",
              width: isMobile ? "100%" : "auto"
            }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRoleSelection("teacher")}
              className="game-button bg-yellow-500 text-white text-xl font-bold px-10 py-4 rounded-full shadow-lg relative"
              style={{ 
                marginLeft: isMobile ? "0" : "1rem",
                width: isMobile ? "90%" : "auto"
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
                marginLeft: isMobile ? "0" : "50px",
                width: isMobile ? "90%" : "auto"
              }}
            >
              👩‍🎓 Student
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="bg-transparent p-8 rounded-3xl shadow-lg border-2 border-yellow-400 relative"
            style={{
              //boxShadow: "0 0 20px rgba(255, 223, 0, 0.5)",
              width: isMobile ? "90%" : "auto",
              marginLeft: isMobile ? "0" : "0px"
            }}
          >

<h2
            className="text-3xl font-bold mb-6 text-center text-yellow-400"
            style={{
              textShadow: "0 0 10px rgba(255, 223, 0, 0.8)",
              fontFamily: "'Cinzel', serif",
              marginLeft: isMobile ? "0" : "690px",
            }}
          >
            {role === "teacher" ? "Teacher Login" : "Student Login"}
          </h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
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
                  marginLeft: isMobile ? "0" : "690px"
                }}
                required
              />
            </div>

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
                  marginLeft: isMobile ? "0" : "690px"
                }}
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-red-500 text-sm text-center"
                style={{
                  textShadow: "0 0 5px rgba(255, 0, 0, 0.8)",
                  marginLeft: isMobile ? "0" : "730px"
                }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="submit"
              className="game-button bg-yellow-500 text-white text-xl font-bold px-10 py-4 rounded-full shadow-lg relative"
              style={{
                boxShadow: "0 0 20px rgba(255, 223, 0, 0.8)",
                marginLeft: isMobile ? "0" : "800px"
              }}
            >
              Login
            </motion.button>
          </form>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setRole(null)}
            className="mt-4 text-sm text-yellow-400 hover:text-yellow-300 text-center w-full"
            style={{
              textShadow: "0 0 5px rgba(255, 223, 0, 0.8)",
              marginLeft: isMobile ? "0" : "730px"
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
