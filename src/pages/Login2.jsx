import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Howl } from "howler";
import axios from "axios";
import { BackgroundImageContext } from "../App";
import logo from "./LogoColor.png";

const Login2 = () => {
  const { backgroundImage } = useContext(BackgroundImageContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // Track selected role (teacher or student)

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    buttonClickSound.play();
    try {
      const response = await fetch("https://moolandia-mern-app.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userType", data.userType);
        localStorage.setItem("userId", data.userId);
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
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
      <form
        onSubmit={handleSubmit}
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

        <div style={{ marginTop: "30px", display: "flex" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.27)",
              width: "150px",
              borderRadius: "3px",
              padding: "5px 10px 10px 5px",
              color: "#eaf0fb",
              textAlign: "center",
            }}
          >
            <i className="fab fa-google" style={{ marginRight: "4px" }}></i> Google
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.27)",
              width: "150px",
              borderRadius: "3px",
              padding: "5px 10px 10px 5px",
              color: "#eaf0fb",
              textAlign: "center",
              marginLeft: "25px",
            }}
          >
            <i className="fab fa-facebook" style={{ marginRight: "4px" }}></i> Facebook
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login2;
