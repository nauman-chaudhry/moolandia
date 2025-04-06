import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./pages/Login";
import Login2 from "./pages/Login2"; // New mobile login component
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Test from "./pages/Test";

function App() {
  // Track if the viewport is mobile-sized
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768); // Adjust breakpoint as needed
    }
    handleResize(); // Check initial width
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Background image effect
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await axios.get("https://moolandia-mern-app.onrender.com/api/season-images");
        if (response.data.success) {
          // Find the image that is set as the background
          const bgImage = response.data.images.find((img) => img.isBackground);
          if (bgImage) {
            const imageUrl = `https://moolandia-mern-app.onrender.com${bgImage.imagePath || bgImage.path}`;
            document.body.style.backgroundImage = `url(${imageUrl})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundRepeat = "no-repeat";
          }
        }
      } catch (error) {
        console.error("Error fetching background image:", error);
      }
    };

    fetchBackgroundImage();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Conditionally render Login2 for mobile screens, otherwise render Login */}
        <Route path="/" element={isMobile ? <Login2 /> : <Login />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/student/:id/dashboard" element={<StudentDashboard />} />
        <Route path="/seasonselector" element={<Test />} />
      </Routes>
    </Router>
  );
}

export default App;
