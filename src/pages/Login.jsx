import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Howl } from "howler";
import axios from "axios";
import { BackgroundImageContext } from "../App";
import logo from "./LogoColor.png";

function Login({ setIsAuthenticated }) {
  const { backgroundImage } = useContext(BackgroundImageContext);
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

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
    setError("");
    buttonClickSound.play();
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    buttonClickSound.play();
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
        if (data.token) {
          // Store the token and user info
          localStorage.setItem("token", data.token);
          localStorage.setItem("userType", data.role);
          if (data.studentId) {
            localStorage.setItem("userId", data.studentId);
          }
          
          // Update authentication state
          setIsAuthenticated(true);
          
          // Navigate based on role
          if (role === "teacher") {
            navigate("/teacher-dashboard");
          } else if (role === "student" && data.studentId) {
            navigate(`/student/${data.studentId}/dashboard`);
          } else {
            setError("Invalid role or missing student ID");
          }
        } else {
          setError("No token received from server");
        }
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        maxWidth: "100vw",
        minHeight: "100vh",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(1rem, 5vw, 2rem)",
        color: "black",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "430px",
          height: "520px",
          position: "absolute",
          transform: "translate(-50%, -50%)",
          left: "50%",
          top: "50%",
        }}
      >
        <div
          style={{
            height: "200px",
            width: "200px",
            position: "absolute",
            borderRadius: "50%",
            background: "linear-gradient(#1845ad, #23a2f6)",
            left: "-80px",
            top: "-80px",
          }}
        ></div>
        <div
          style={{
            height: "200px",
            width: "200px",
            position: "absolute",
            borderRadius: "50%",
            background: "linear-gradient(to right, #ff512f, #f09819)",
            right: "-30px",
            bottom: "-80px",
          }}
        ></div>
      </div>

      {!role ? (
        <div
          style={{
            height: "520px",
            width: "400px",
            backgroundColor: "rgba(255,255,255,0.13)",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            top: "50%",
            left: "50%",
            borderRadius: "10px",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 40px rgba(8,7,16,0.6)",
            padding: "50px 35px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h3 style={{ fontSize: "32px", fontWeight: "500", lineHeight: "42px", textAlign: "center", color: "#ffffff" }}>
            Select Your Role
          </h3>
          <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
            <button
              onClick={() => handleRoleSelection("teacher")}
              style={{
                width: "150px",
                padding: "15px 0",
                fontSize: "18px",
                fontWeight: "600",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor: "#ffffff",
                color: "#080710",
                border: "none",
              }}
            >
              Teacher
            </button>
            <button
              onClick={() => handleRoleSelection("student")}
              style={{
                width: "150px",
                padding: "15px 0",
                fontSize: "18px",
                fontWeight: "600",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor: "#ffffff",
                color: "#080710",
                border: "none",
              }}
            >
              Student
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleLogin}
          style={{
            height: "520px",
            width: "400px",
            backgroundColor: "rgba(255,255,255,0.13)",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            top: "50%",
            left: "50%",
            borderRadius: "10px",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 40px rgba(8,7,16,0.6)",
            padding: "50px 35px",
          }}
        >
          <h3 style={{ fontSize: "32px", fontWeight: "500", lineHeight: "42px", textAlign: "center", color: "#ffffff" }}>
            Login Here
          </h3>

          <label htmlFor="username" style={{ display: "block", marginTop: "30px", fontSize: "16px", fontWeight: "500", color: "#ffffff" }}>
            Username
          </label>
          <input
            type="text"
            placeholder="Email or Phone"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              display: "block",
              height: "50px",
              width: "100%",
              backgroundColor: "rgba(255,255,255,0.07)",
              borderRadius: "3px",
              padding: "0 10px",
              marginTop: "8px",
              fontSize: "14px",
              fontWeight: "300",
              color: "#ffffff",
            }}
          />

          <label htmlFor="password" style={{ display: "block", marginTop: "30px", fontSize: "16px", fontWeight: "500", color: "#ffffff" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              display: "block",
              height: "50px",
              width: "100%",
              backgroundColor: "rgba(255,255,255,0.07)",
              borderRadius: "3px",
              padding: "0 10px",
              marginTop: "8px",
              fontSize: "14px",
              fontWeight: "300",
              color: "#ffffff",
            }}
          />

          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

          <button
            type="submit"
            style={{
              marginTop: "50px",
              width: "100%",
              backgroundColor: "#ffffff",
              color: "#080710",
              padding: "15px 0",
              fontSize: "18px",
              fontWeight: "600",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Log In
          </button>

          <button
            type="button"
            onClick={() => setRole(null)}
            style={{
              marginTop: "20px",
              width: "100%",
              backgroundColor: "transparent",
              color: "#ffffff",
              padding: "15px 0",
              fontSize: "14px",
              fontWeight: "600",
              borderRadius: "5px",
              cursor: "pointer",
              border: "1px solid #ffffff",
            }}
          >
            Back to Role Selection
          </button>
        </form>
      )}
    </div>
  );
}

export default Login;
