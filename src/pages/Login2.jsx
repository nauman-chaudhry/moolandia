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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check device size
  useEffect(() => {
    const checkDeviceSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width <= 1024);
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
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8"
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
        className={`mb-4 sm:mb-6 md:mb-8 ${
          isMobile ? "w-20" : isTablet ? "w-24" : "w-32"
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
          className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white mb-4 sm:mb-5 md:mb-6">
            Select Your Role
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelection("teacher")}
              className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-3 md:px-6 md:py-4 bg-yellow-500 text-white text-sm sm:text-base md:text-lg font-bold rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
            >
              🧑‍🏫 Teacher
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelection("student")}
              className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-3 md:px-6 md:py-4 bg-green-500 text-white text-sm sm:text-base md:text-lg font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors"
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
          className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white mb-4 sm:mb-5 md:mb-6">
            {role === "teacher" ? "Teacher Login" : "Student Login"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 sm:px-5 sm:py-3 md:px-6 md:py-4 bg-black/50 text-white placeholder-gray-300 rounded-full border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 sm:px-5 sm:py-3 md:px-6 md:py-4 bg-black/50 text-white placeholder-gray-300 rounded-full border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 text-sm sm:text-base"
                required
              />
            </div>

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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full px-4 py-2 sm:px-5 sm:py-3 md:px-6 md:py-4 bg-yellow-500 text-white text-sm sm:text-base md:text-lg font-bold rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
            >
              Login
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRole(null)}
              className="w-full text-yellow-400 hover:text-yellow-300 text-center text-sm sm:text-base"
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
