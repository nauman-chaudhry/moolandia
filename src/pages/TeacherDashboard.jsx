import React, { useState, useEffect, useRef } from "react";
import backgroundImage from "./background2@2x.png";

const TeacherDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [pendingTasks, setPendingTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");

  // Refs for dropdowns
  const taskDropdownRef = useRef(null);
  const studentDropdownRef = useRef(null);

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const studentsResponse = await fetch("/api/students");
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);

        // Fetch tasks
        const tasksResponse = await fetch("/api/tasks");
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);

        // Fetch pending tasks
        const pendingTasksResponse = await fetch("/api/tasks/pending");
        const pendingTasksData = await pendingTasksResponse.json();
        setPendingTasks(pendingTasksData);

        // Fetch marketplace items
        const marketplaceResponse = await fetch("/api/marketplace");
        const marketplaceData = await marketplaceResponse.json();
        setMarketplaceItems(marketplaceData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // Function to create a new student
  const createStudent = async () => {
    if (!newStudentName || !newStudentPassword) return; // Validate inputs

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStudentName, password: newStudentPassword }), // Include password
      });

      const newStudent = await response.json();
      setStudents([...students, newStudent]);
      setNewStudentName("");
      setNewStudentPassword(""); // Clear password input
    } catch (err) {
      console.error("Error creating student:", err);
    }
  };

  // Function to create a new task
  const createTask = async (taskName, reward) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: taskName, reward }),
      });

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  // Function to assign a task to a student
  const assignTask = async () => {
    const taskId = taskDropdownRef.current.value;
    const studentId = studentDropdownRef.current.value;

    try {
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
    } catch (err) {
      console.error("Error assigning task:", err);
    }
  };

  // Function to delete a student
  const deleteStudent = async (studentId) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      // Remove the student from the state
      setStudents(students.filter((student) => student._id !== studentId));
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  // Function to delete a task
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // Remove the task from the state
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Function to add a marketplace item
  const addMarketplaceItem = async (itemName, price) => {
    try {
      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: itemName, price }),
      });

      const newItem = await response.json();
      setMarketplaceItems([...marketplaceItems, newItem]);
    } catch (err) {
      console.error("Error adding marketplace item:", err);
    }
  };

  // Function to apply a fine to a student
  const applyFine = async (studentId, amount) => {
    try {
      const response = await fetch(`/api/students/${studentId}/fine`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to apply fine");
      }
  
      const updatedStudent = await response.json();
      setStudents(students.map((student) =>
        student._id === updatedStudent._id ? updatedStudent : student
      ));
    } catch (err) {
      console.error("Error applying fine:", err);
    }
  };

  const handleTaskApproval = async (taskId, status, comment) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comment }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
  
      const updatedTask = await response.json();
  
      // Update the task list and remove the approved/rejected task from pending tasks
      setPendingTasks(pendingTasks.filter((task) => task._id !== updatedTask._id));
      setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
  
      // Clear the selected task and comment
      setSelectedTask(null);
      setApprovalComment("");
    } catch (err) {
      console.error("Error updating task status:", err);
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
        🏰 Moolandia Classroom Economy
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
        {/* Create Student Section */}
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
            Create Student
          </h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Student Name"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                flex: "1",
                backgroundColor: "#fef3c7",
              }}
            />
            <input
              type="password"
              placeholder="Student Password"
              value={newStudentPassword}
              onChange={(e) => setNewStudentPassword(e.target.value)}
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                flex: "1",
                backgroundColor: "#fef3c7",
              }}
            />
            <button
              onClick={createStudent}
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
              🎓 Create Student
            </button>
          </div>
        </div>

        {/* Task Creation Section */}
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
            Create Task
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const taskName = e.target.taskName.value;
              const reward = parseInt(e.target.reward.value, 10);
              createTask(taskName, reward);
              e.target.reset();
            }}
          >
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <input
                type="text"
                name="taskName"
                placeholder="Task Name"
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  flex: "1",
                  backgroundColor: "#fef3c7",
                }}
                required
              />
              <input
                type="number"
                name="reward"
                placeholder="Reward (Moolah)"
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  width: "8rem",
                  backgroundColor: "#fef3c7",
                }}
                required
              />
              <button
                type="submit"
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
                🎯 Create Task
              </button>
            </div>
          </form>
        </div>

        {/* Task Assignment Section */}
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
            Assign Task
          </h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <select
              ref={taskDropdownRef}
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                flex: "1",
                backgroundColor: "#fef3c7",
              }}
            >
              {tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.name} (+{task.reward} Moolah)
                </option>
              ))}
            </select>
            <select
              ref={studentDropdownRef}
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                flex: "1",
                backgroundColor: "#fef3c7",
              }}
            >
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.icon} {student.name} (Level {student.level})
                </option>
              ))}
            </select>
            <button
              onClick={assignTask}
              style={{
                backgroundColor: "#3b82f6",
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
              🚀 Assign Task
            </button>
            <button
              onClick={() => {
                const taskId = taskDropdownRef.current.value;
                deleteTask(taskId);
              }}
              style={{
                backgroundColor: "#ef4444",
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
              🗑️ Delete Task
            </button>
          </div>
        </div>

        {/* Pending Task Approvals Section */}
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
            Pending Task Approvals
          </h3>
          {pendingTasks.length === 0 ? (
            <p>No tasks pending approval.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {pendingTasks.map((task) => (
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
                  }}
                >
                  <div>
                    <span style={{ fontSize: "1.125rem", fontWeight: "600" }}>{task.name}</span>
                    <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      Assigned to: {task.assignedTo?.name || "Unassigned"}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTask(task)}
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Review Task
                  </button>
                </div>
              ))}
            </div>
          )}

{selectedTask && (
  <div style={{ marginTop: "1rem" }}>
    <h4
      style={{
        fontSize: "1.25rem",
        fontWeight: "600",
        marginBottom: "0.5rem",
        color: "#78350f",
      }}
    >
      Review Task: {selectedTask.name}
    </h4>
    <textarea
      placeholder="Add a comment (optional)"
      value={approvalComment}
      onChange={(e) => setApprovalComment(e.target.value)}
      style={{
        width: "100%",
        padding: "0.5rem",
        borderRadius: "0.5rem",
        border: "1px solid #e5e7eb",
        marginBottom: "1rem",
      }}
    />
    <div style={{ display: "flex", gap: "1rem" }}>
      <button
        onClick={() => handleTaskApproval(selectedTask._id, "approved", approvalComment)}
        style={{
          backgroundColor: "#10b981",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        ✅ Approve
      </button>
      <button
        onClick={() => handleTaskApproval(selectedTask._id, "rejected", approvalComment)}
        style={{
          backgroundColor: "#ef4444",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        ❌ Reject
      </button>
    </div>
  </div>
)}
        </div>

        {/* Student Balances Section */}
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
            Student Balances
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {students.map((student) => (
              <div
                key={student._id}
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>{student.icon}</span>
                  <div>
                    <span style={{ fontSize: "1.125rem", fontWeight: "600" }}>{student.name}</span>
                    <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>Level {student.level}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#15803d" }}>
                    {student.balance} Moolah
                  </span>
                  <button
                    onClick={() => deleteStudent(student._id)}
                    style={{
                      backgroundColor: "#ef4444",
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
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marketplace Management Section */}
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const itemName = e.target.itemName.value;
              const price = parseInt(e.target.price.value, 10);
              addMarketplaceItem(itemName, price);
              e.target.reset();
            }}
          >
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <input
                type="text"
                name="itemName"
                placeholder="Item Name"
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  flex: "1",
                  backgroundColor: "#fef3c7",
                }}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price (Moolah)"
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  width: "8rem",
                  backgroundColor: "#fef3c7",
                }}
                required
              />
              <button
                type="submit"
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
                🛒 Add Item
              </button>
            </div>
          </form>
          <div style={{ marginTop: "1rem" }}>
            <h4
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#78350f",
              }}
            >
              Current Marketplace Items
            </h4>
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
                  <span style={{ fontSize: "1.125rem", fontWeight: "600" }}>{item.name}</span>
                  <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#15803d" }}>
                    {item.price} Moolah
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fines Application Section */}
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
            Apply Fine
          </h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <select
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                flex: "1",
                backgroundColor: "#fef3c7",
              }}
            >
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.icon} {student.name} (Level {student.level})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Fine Amount"
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                width: "8rem",
                backgroundColor: "#fef3c7",
              }}
            />
            <button
              onClick={() => {
                const studentId = document.querySelector('select').value;
                const amount = parseInt(document.querySelector('input[type="number"]').value, 10);
                applyFine(studentId, amount);
              }}
              style={{
                backgroundColor: "#ef4444",
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
              ⚖️ Apply Fine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;