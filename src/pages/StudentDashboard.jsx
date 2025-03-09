import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import backgroundImage from "./background2@2x.png"; // Ensure the path is correct

const StudentDashboard = () => {
  const { id: studentId } = useParams(); // Extract studentId from the URL
  const [balance, setBalance] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [icon, setIcon] = useState("🐮");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student-specific data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/students/${studentId}/dashboard`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setBalance(data.balance);
        setTasks(data.tasks);
        setTransactions(data.transactions);
        setMarketplaceItems(data.marketplaceItems);
        setIcon(data.icon);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Function to mark a task as complete (pending teacher approval)
  const completeTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "PUT",
      });
      const updatedTask = await response.json();

      // Update the task list
      setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  // Function to purchase an item from the marketplace
  const purchaseItem = async (itemId) => {
    const item = marketplaceItems.find((i) => i._id === itemId);
    if (item && balance >= item.price) {
      try {
        // Deduct the price from the student's balance
        const response = await fetch(`/api/students/${studentId}/balance`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: -item.price }), // Subtract the price
        });
        const updatedStudent = await response.json();
        setBalance(updatedStudent.balance);

        // Create a transaction for the purchase
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student: studentId,
            type: "Spent",
            amount: item.price,
            description: `Purchased item: ${item.name}`,
          }),
        });

        // Update the icon if the item is a custom icon
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

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "auto",
        padding: "2rem",
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontSize: "2.25rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          textAlign: "center",
          color: "#fbbf24",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        🏰 Moolandia Student Dashboard
      </h2>

      {/* Main Content Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "80rem",
          margin: "0 auto",
          flex: "1",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Balance Section */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "1.5rem",
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
            Your Balance
          </h3>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#15803d",
            }}
          >
            {balance} Moolah
          </p>
        </div>

        {/* To-Do Tasks Section */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "1.5rem",
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
            To-Do Tasks
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {tasks.map((task) => (
              <div
                key={task._id}
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
                  <span style={{ fontSize: "1.125rem", fontWeight: "600" }}>{task.name}</span>
                  <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                    Reward: {task.reward} Moolah
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                    Status: {task.status}
                  </div>
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
                    onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                    onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
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
            padding: "1.5rem",
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
            Recent Transactions
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
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
                  <span style={{ fontSize: "1.125rem", fontWeight: "600" }}>
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
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "1.5rem",
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
                  <span style={{ fontSize: "1.125rem", fontWeight: "600" }}>{item.name}</span>
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

        {/* Icon Customization Section */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "1.5rem",
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
            Your Icon
          </h3>
          <div
            style={{
              fontSize: "4rem",
              marginBottom: "1rem",
            }}
          >
            {icon}
          </div>
          <button
            onClick={() => purchaseItem("custom-icon-id")} // Replace with actual ID
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
            Customize Icon (50 Moolah)
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;