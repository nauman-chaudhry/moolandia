import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Login from "./pages/Login";
import Login2 from "./pages/Login2"; // New mobile login component
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Test from "./pages/Test";

// Create a context for the background image
export const BackgroundImageContext = createContext();

function App() {
  // Track if the viewport is mobile-sized
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const response = await axios.get("https://moolandia-mern-app.onrender.com/api/auth/check-auth", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch and set background image
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await axios.get("https://moolandia-mern-app.onrender.com/api/season-images");
        if (response.data.success) {
          const bgImage = response.data.images.find((img) => img.isBackground);
          if (bgImage) {
            const imageUrl = `https://moolandia-mern-app.onrender.com${bgImage.imagePath || bgImage.path}`;
            setBackgroundImage(imageUrl);
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
      return <div>Loading...</div>;
    }
    return isAuthenticated ? children : <Navigate to="/" replace />;
  };

  return (
    <BackgroundImageContext.Provider value={{ backgroundImage, setBackgroundImage }}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={
              isMobile ? (
                <Login2 setIsAuthenticated={setIsAuthenticated} />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            } 
          />
          
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
    </BackgroundImageContext.Provider>
  );
}

export default App;
