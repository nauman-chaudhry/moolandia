import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Howl } from "howler";
import axios from "axios";
import logo from "./LogoColor.png";

const Login2 = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [bg, setBg] = useState(null);
  const [isTablet, setIsTablet] = useState(false);

  // Check device size
  useEffect(() => {
    const checkDeviceSize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth <= 1024);
    };
    
    checkDeviceSize();
    window.addEventListener('resize', checkDeviceSize);
    return () => window.removeEventListener('resize', checkDeviceSize);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    buttonClickSound.play();
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://moolandia-mern-app.onrender.com';
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        if (data.studentId) {
          localStorage.setItem("studentId", data.studentId);
        }
        setIsAuthenticated(true);
        successSound.play();
        if (role === "teacher") {
          navigate("/teacher-dashboard", { replace: true });
        } else {
          navigate(`/student/${data.studentId}/dashboard`, { replace: true });
        }
      } else {
        setError(data.error || "Login failed");
        errorSound.play();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      errorSound.play();
    }
  };

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-start pt-2 pb-4 px-3 overflow-hidden"
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
        className={`mb-1 sm:mb-2 w-full ${
          isTablet ? "max-w-[120px]" : "max-w-[100px] sm:max-w-[150px]"
        }`}
      >
        <img src={logo} alt="Game Logo" className="w-full" />
      </motion.div>

      {!role ? (
        // Role Selection
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-[280px] sm:max-w-[320px] bg-white/10 backdrop-blur-md rounded-2xl p-2 sm:p-3 md:p-4 shadow-lg"
        >
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-center text-white mb-2 sm:mb-3 md:mb-4">
            Select Your Role
          </h2>
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 md:gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelection("teacher")}
              className="w-full sm:w-auto px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-yellow-500 text-white text-xs sm:text-sm md:text-base font-bold rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
            >
              🧑‍🏫 Teacher
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelection("student")}
              className="w-full sm:w-auto px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-green-500 text-white text-xs sm:text-sm md:text-base font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors"
            >
              👩‍🎓 Student
            </motion.button>
          </div>
        </motion.div>
      ) : (
        // Login Form
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-[280px] sm:max-w-[320px] bg-white/10 backdrop-blur-md rounded-2xl p-2 sm:p-3 md:p-4 shadow-lg"
        >
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-center text-white mb-2 sm:mb-3 md:mb-4">
            {role === "teacher" ? "Teacher Login" : "Student Login"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2 md:space-y-3">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-black/50 text-white placeholder-gray-300 rounded-full border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-black/50 text-white placeholder-gray-300 rounded-full border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 text-xs sm:text-sm"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-red-400 text-center text-[10px] sm:text-xs"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-yellow-500 text-white text-xs sm:text-sm md:text-base font-bold rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
            >
              Login
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRole(null)}
              className="w-full px-2 py-1 text-yellow-400 hover:text-yellow-300 text-center text-[10px] sm:text-xs"
            >
              ← Back to Role Selection
            </motion.button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Login2;
