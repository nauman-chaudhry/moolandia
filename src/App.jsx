import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("https://moolandia-mern-app.onrender.com/api/auth/check-auth", {
          withCredentials: true
        });
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

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

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div>Loading...</div>; // You can replace this with a proper loading component
    }
    return isAuthenticated ? children : <Navigate to="/" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isMobile ? <Login2 /> : <Login />} />
        
        {/* Protected routes */}
        <Route 
          path="/teacher-dashboard" 
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/:id/dashboard" 
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seasonselector" 
          element={
            <ProtectedRoute>
              <Test />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
