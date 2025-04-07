import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import cow1 from "./cows/c1.png";
import cow2 from "./cows/c2.png";
import cow3 from "./cows/c3.png";
import cow4 from "./cows/c4.png";
import cow5 from "./cows/c5.png";
import cow6 from "./cows/c6.png";
import cow7 from "./cows/c7.png";
import cow9 from "./cows/c9.png";
import cow10 from "./cows/c10.png";
import cow11 from "./cows/c11.png";
import cow12 from "./cows/c12.png";
import cow13 from "./cows/c13.png";
import cow14 from "./cows/c14.png";
import coinImage from "./coin.png";
import { Howl } from "howler";

const StudentDashboard = () => {
  const { id: studentId } = useParams(); // Extract studentId from the URL
  const [balance, setBalance] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [cowIcon, setCowIcon] = useState(null);
  const [level, setLevel] = useState(1); // Track the student's level
  const [completedTasks, setCompletedTasks] = useState(0); // Track completed tasks for the current level
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentClass, setStudentClass] = useState(null);
  const [levelConfigs, setLevelConfigs] = useState([]);
  const [bg, setBg] = useState(null); // State to hold the fetched background image URL

  const cowIcons = [
    { id: "c1", image: cow1, price: 50 },
    { id: "c2", image: cow2, price: 75 },
    { id: "c3", image: cow3, price: 100 },
    { id: "c4", image: cow4, price: 50 },
    { id: "c5", image: cow5, price: 75 },
    { id: "c6", image: cow6, price: 100 },
    { id: "c7", image: cow7, price: 50 },
    { id: "c9", image: cow9, price: 75 },
    { id: "c10", image: cow10, price: 100 },
    { id: "c11", image: cow11, price: 50 },
    { id: "c12", image: cow12, price: 75 },
    { id: "c13", image: cow13, price: 100 },
    { id: "c14", image: cow14, price: 50 },
  ];

  const [buttonClickSound] = useState(
    new Howl({
      src: ["https://www.soundjay.com/buttons/button-3.mp3"],
      volume: 0.5,
    })
  );

  // Fetch level configurations
  useEffect(() => {
    const fetchLevelConfigs = async () => {
      try {
          const response = await fetch("https://moolandia-mern-app.onrender.com/api/levelConfig");
        const data = await response.json();
        setLevelConfigs(data);
      } catch (err) {
        console.error("Error fetching level configurations:", err);
      }
    };
    fetchLevelConfigs();
  }, []);

  // Fetch student-specific data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentResponse, configsResponse] = await Promise.all([
          fetch(`/api/students/${studentId}/dashboard`),
          fetch("/api/levelConfig"),
        ]);

        if (!studentResponse.ok || !configsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const studentData = await studentResponse.json();
        const configsData = await configsResponse.json();

        setBalance(studentData.balance);
        setTasks(studentData.tasks);
        setTransactions(studentData.transactions);
        setMarketplaceItems(studentData.marketplaceItems);
        setCowIcon(studentData.cowIcon);
        setLevel(studentData.level);
        setCompletedTasks(studentData.completedTasks);
        setStudentClass(studentData.class);
        setLevelConfigs(configsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Fetch class data on component mount
  useEffect(() => {
    const fetchClass = async () => {
      try {
          const response = await fetch(`https://moolandia-mern-app.onrender.com/api/students/${studentId}/dashboard`);
        const data = await response.json();
        if (data.class) {
            const classResponse = await fetch(`https://moolandia-mern-app.onrender.com/api/classes/${data.class}`);
          const classData = await classResponse.json();
          setStudentClass(classData);
        }
      } catch (err) {
        console.error("Error fetching class:", err);
      }
    };
    fetchClass();
  }, [studentId]);

  // Fetch background image from the backend
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await fetch("/api/season-images");
        const data = await response.json();
        if (data.success && data.images.length > 0) {
          // Use an image flagged as background, or default to the first image
          const bgImage =
            data.images.find((img) => img.isBackground) || data.images[0];
          const imageUrl = `https://moolandia-mern-app.onrender.com${bgImage.path || bgImage.imagePath}`;
          setBg(imageUrl);
        }
      } catch (err) {
        console.error("Error fetching background image:", err);
      }
    };
    fetchBackgroundImage();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Function to purchase a cow icon
  const purchaseCowIcon = async (cow) => {
    buttonClickSound.play();
    if (balance < cow.price) {
      alert("Not enough Moolah!");
      return;
    }

    try {
      // Deduct the price from the student's balance
        const balanceResponse = await fetch(`https://moolandia-mern-app.onrender.com/api/students/${studentId}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: -cow.price }),
      });
      const updatedStudent = await balanceResponse.json();
      setBalance(updatedStudent.balance);

      // Update the student's cow icon in the backend
      const iconResponse = await fetch(
        `/api/students/${studentId}/updateIcon`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cowIcon: cow.image }),
        }
      );
      const updatedIconStudent = await iconResponse.json();
      setCowIcon(updatedIconStudent.cowIcon);

      // Create a transaction for the purchase
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: studentId,
          type: "Spent",
          amount: cow.price,
          description: `Purchased cow icon: ${cow.id}`,
        }),
      });

      alert("Cow icon purchased successfully!");
    } catch (err) {
      console.error("Error purchasing cow icon:", err);
      alert("Failed to purchase cow icon. Please try again.");
    }
  };

  // Function to mark a task as complete (pending teacher approval)
  const completeTask = async (taskId) => {
    buttonClickSound.play();
    try {
        const response = await fetch(`https://moolandia-mern-app.onrender.com/api/tasks/${taskId}/complete`, {
        method: "PUT",
      });
      const updatedTask = await response.json();

      // Update the task list
      setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));

      if (updatedTask.status === "pending") {
        const currentLevelConfig = levelConfigs.find((l) => l.level === level);
        const tasksRequired = currentLevelConfig?.tasksRequired || 5;
        const newCompletedTasks = Math.min(completedTasks + 1, tasksRequired);
        setCompletedTasks(newCompletedTasks);
      }
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  // Function to purchase an item from the marketplace
  const purchaseItem = async (itemId) => {
    buttonClickSound.play();
    const item = marketplaceItems.find((i) => i._id === itemId);
    if (item && balance >= item.price) {
      try {
          const response = await fetch(`https://moolandia-mern-app.onrender.com/api/students/${studentId}/balance`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: -item.price }),
        });
        const updatedStudent = await response.json();
        setBalance(updatedStudent.balance);

          await fetch("https://moolandia-mern-app.onrender.com/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student: studentId,
            type: "Spent",
            amount: item.price,
            description: `Purchased item: ${item.name}`,
          }),
        });

        if (item.name === "Custom Icon") {
          setIcon("🌟");
        }
      } catch (err) {
        console.error("Error purchasing item:", err);
      }
    } else {
      alert("Not enough Moolah!");
    }
  };

  const incompleteTasks = tasks.filter(
    (task) => task.status === "nan" || task.status === "completed"
  );

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundImage: bg ? `url(${bg})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "auto",
        padding: "clamp(1rem, 5%, 2rem)",
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
          fontWeight: "bold",
          margin: "2rem 0",
          textAlign: "center",
          color: "#fbbf24",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          width: "100%",
          maxWidth: "1400px", // Match main container width
          padding: "0 clamp(1rem, 5%, 2rem)", // Equal side padding
        }}
      >
        🏰 Moolandia Student Dashboard
      </h2>

      {/* Main Content Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          flex: "1",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Top Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* Balance Section */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "#78350f" }}>
              Your Balance
            </h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <p style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)", fontWeight: "bold", color: "#15803d" }}>
                {balance} Moolah
              </p>
              <img
                src={coinImage}
                alt="Coin"
                style={{
                  width: "clamp(40px, 8vw, 92px)",
                  height: "clamp(40px, 8vw, 92px)",
                }}
              />
            </div>
          </div>
          </div>
        {/* Class Section */}
        <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              textAlign: "center",
            }}
          >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#78350f",
            }}
          >
            Your Class
          </h3>
          {studentClass ? (
            <div>
              <span style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                {studentClass.name}
              </span>
              <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                {studentClass.students?.length || 0} Students
              </div>
            </div>
          ) : (
            <p>No class assigned.</p>
          )}
        </div>
        {/* Level and Progress Bar Section */}
        <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              textAlign: "center",
            }}
          >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#78350f",
            }}
          >
            Level {level}
          </h3>
          {levelConfigs.length > 0 ? (
            <>
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${
                      (completedTasks /
                        (levelConfigs.find((l) => l.level === level)?.tasksRequired ||
                          5)) *
                      100
                    }%`,
                    height: "1rem",
                    backgroundColor: "#10b981",
                    borderRadius: "0.5rem",
                  }}
                />
              </div>
              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.875rem",
                  color: "#4b5563",
                }}
              >
                {completedTasks} /{" "}
                {levelConfigs.find((l) => l.level === level)?.tasksRequired || 5}{" "}
                tasks completed
              </p>
              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.875rem",
                  color: "#4b5563",
                }}
              >
                Level reward:{" "}
                {levelConfigs.find((l) => l.level === level)?.reward || 0} Moolah
              </p>
            </>
          ) : (
            <p>Loading level information...</p>
          )}
        </div>
        {/* Responsive Content Sections */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        ></div>
         {/* Tasks Section */}
         <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#78350f" }}>
              To-Do Tasks
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
            {incompleteTasks.map((task) => (
              <div
                key={task._id}
                style={{
                  backgroundColor: "#fef3c7",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  border: "2px solid #fbbf24",
                }}
              >
                <span
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                  }}
                >
                  {task.name}
                </span>
                <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                  Reward: {task.reward} Moolah
                </div>
                <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                  Status: {task.status}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                  Comment: {task.teacherComment || "No comment"}
                </div>
                {!task.completed && (
                  <button
                    onClick={() => completeTask(task._id)}
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      fontWeight: "bold",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.transform = "scale(1)")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.transform = "scale(0.9)")
                    }
                  >
                    Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Recent Transactions Section */}
        <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#78350f" }}>
              Recent Transactions
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                style={{
                  backgroundColor: "#fef3c7",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "2px solid #fbbf24",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                    }}
                  >
                    {transaction.type}: {transaction.amount} Moolah
                  </span>
                  <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                    {transaction.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Marketplace Section */}
        {/* Marketplace Sections */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* Regular Marketplace */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#78350f",
            }}
          >
            Marketplace
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {marketplaceItems.map((item) => (
              <div
                key={item._id}
                style={{
                  backgroundColor: "#fef3c7",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "2px solid #fbbf24",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                    }}
                  >
                    {item.name}
                  </span>
                  <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                    Price: {item.price} Moolah
                  </div>
                </div>
                <button
                  onClick={() => purchaseItem(item._id)}
                  style={{
                    backgroundColor: "#8b5cf6",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    fontWeight: "bold",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                  onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                >
                  Buy
                </button>
              </div>
            ))}
          </div>
        </div>
        </div>
        
        {/* Cow Icon Section */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "1rem",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#78350f",
            }}
          >
            Your Cow Icon
          </h3>
          {cowIcon ? (
            <img
              src={cowIcon}
              alt="Cow Icon"
              style={{ width: "100px", height: "100px" }}
            />
          ) : (
            <p>No cow icon selected.</p>
          )}
        </div>
        {/* Cow Marketplace */}
        <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#78350f" }}>
              Cow Icon Marketplace
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "1rem",
              }}
            >
              {cowIcons.map((cow) => (
                <div
                  key={cow.id}
                  style={{
                    backgroundColor: "#fef3c7",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <img
                    src={cow.image}
                    alt={cow.id}
                    style={{ width: "clamp(40px, 10vw, 60px)", height: "auto" }}
                  />
                  <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                    {cow.price} Moolah
                  </span>
                  <button
                    style={{
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.9rem",
                      width: "100%",
                      maxWidth: "80px",
                    }}
                  >
                    Buy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

    </div>
  );
};

export default StudentDashboard;
