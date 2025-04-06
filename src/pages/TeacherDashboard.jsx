import React, { useState, useEffect, useRef } from "react";
// Remove the static import for backgroundImage
// import backgroundImage from "./pic.jpeg";
import { Howl } from "howler";

const TeacherDashboard = () => {
  const [bg, setBg] = useState(null); // State to hold the fetched background image URL
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [pendingTasks, setPendingTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null); // Track selected student
  const [studentDetails, setStudentDetails] = useState(null); // Store student details
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassDetails, setSelectedClassDetails] = useState(null);
  const [levelConfigs, setLevelConfigs] = useState([]);
  const [newLevelConfig, setNewLevelConfig] = useState({
    level: "",
    tasksRequired: "",
    reward: "",
    description: ""
  });

  // Refs for dropdowns
  const taskDropdownRef = useRef(null);
  const studentDropdownRef = useRef(null);

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
        const response = await fetch("/api/levelConfig");
        const data = await response.json();
        setLevelConfigs(data);
      } catch (err) {
        console.error("Error fetching level configurations:", err);
      }
    };
    fetchLevelConfigs();
  }, []);

  // Manage level configuration changes
  const handleLevelConfigChange = (e) => {
    const { name, value } = e.target;
    setNewLevelConfig({
      ...newLevelConfig,
      [name]: value
    });
  };

  const saveLevelConfig = async () => {
    buttonClickSound.play();
    try {
      const response = await fetch("/api/levelConfig", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLevelConfig)
      });
      const savedConfig = await response.json();
      
      setLevelConfigs(prev => {
        const existing = prev.find(l => l.level === savedConfig.level);
        if (existing) {
          return prev.map(l => l.level === savedConfig.level ? savedConfig : l);
        }
        return [...prev, savedConfig].sort((a, b) => a.level - b.level);
      });
      
      setNewLevelConfig({
        level: "",
        tasksRequired: "",
        reward: "",
        description: ""
      });
    } catch (err) {
      console.error("Error saving level configuration:", err);
    }
  };

  const deleteLevelConfig = async (level) => {
    buttonClickSound.play();
    try {
      await fetch(`/api/levelConfig/${level}`, { method: "DELETE" });
      setLevelConfigs(prev => prev.filter(l => l.level !== level));
    } catch (err) {
      console.error("Error deleting level configuration:", err);
    }
  };

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

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes");
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // Function to fetch students in a class
  const fetchStudentsInClass = async (classId) => {
    try {
      const response = await fetch(`/api/classes/${classId}/students`);
      if (!response.ok) {
        throw new Error("Failed to fetch students in class");
      }
      const data = await response.json();
      setSelectedClassDetails(data);
    } catch (err) {
      console.error("Error fetching students in class:", err);
    }
  };

  // Function to create a new class
  const createClass = async () => {
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName }),
      });
      const newClass = await response.json();
      setClasses([...classes, newClass]);
      setNewClassName("");
    } catch (err) {
      console.error("Error creating class:", err);
    }
  };

  // Function to delete a class
  const deleteClass = async (classId) => {
    try {
      await fetch(`/api/classes/${classId}`, { method: "DELETE" });
      setClasses(classes.filter((c) => c._id !== classId));
    } catch (err) {
      console.error("Error deleting class:", err);
    }
  };

  const assignStudentToClass = async (studentId, classId) => {
    try {
      const response = await fetch(`/api/students/${studentId}/updateClass`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign student to class");
      }

      const updatedStudent = await response.json();
      console.log("Student assigned to class:", updatedStudent);
    } catch (err) {
      console.error("Error assigning student to class:", err);
      alert(err.message);
    }
  };

  // Function to fetch student details
  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await fetch(`/api/students/${studentId}/dashboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch student details");
      }
      const data = await response.json();
      setStudentDetails(data);
    } catch (err) {
      console.error("Error fetching student details:", err);
    }
  };

  // Function to handle student click
  const handleStudentClick = async (studentId) => {
    setSelectedStudent(studentId);
    await fetchStudentDetails(studentId);
  };

  // Function to close the student details modal
  const closeStudentDetails = () => {
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  // Function to create a new student
  const createStudent = async () => {
    buttonClickSound.play();
    if (!newStudentName || !newStudentPassword) return;

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStudentName, password: newStudentPassword }),
      });

      const newStudent = await response.json();
      setStudents([...students, newStudent]);
      setNewStudentName("");
      setNewStudentPassword("");
    } catch (err) {
      console.error("Error creating student:", err);
    }
  };

  // Function to create a new task
  const createTask = async (taskName, reward) => {
    buttonClickSound.play();
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

  // Function to assign a task to multiple students
  const assignTask = async () => {
    buttonClickSound.play();
    const taskId = taskDropdownRef.current.value;
    const selectedStudentIds = Array.from(studentDropdownRef.current.selectedOptions).map(
      (option) => option.value
    );

    try {
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudentIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign task");
      }

      const assignedTasks = await response.json();
      setTasks([...tasks, ...assignedTasks]);

      alert("Task assigned to selected students successfully!");
    } catch (err) {
      console.error("Error assigning task:", err);
      alert("Failed to assign task. Please try again.");
    }
  };

  // Function to delete a student
  const deleteStudent = async (studentId) => {
    buttonClickSound.play();
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      setStudents(students.filter((student) => student._id !== studentId));
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  // Function to delete a task
  const deleteTask = async (taskId) => {
    buttonClickSound.play();
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Function to add a marketplace item
  const addMarketplaceItem = async (itemName, price) => {
    buttonClickSound.play();
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

  // Function to delete a marketplace item
  const deleteMarketplaceItem = async (itemId) => {
    buttonClickSound.play();
    try {
      const response = await fetch(`/api/marketplace/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setMarketplaceItems(marketplaceItems.filter((item) => item._id !== itemId));
    } catch (err) {
      console.error("Error deleting marketplace item:", err);
      alert("Failed to delete marketplace item. Please try again.");
    }
  };

  // Function to generate student balances report
  const generateBalancesReport = async () => {
    buttonClickSound.play();
    try {
      const response = await fetch("/api/students/report/balances");
      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }
      const reportData = await response.json();

      const csvHeaders = "Name,Class,Balance,Level,Completed Tasks\n";
      const csvRows = reportData.map(student => 
        `"${student.name}","${student.class}",${student.balance},${student.level},${student.completedTasks}`
      ).join("\n");
      const csvContent = csvHeaders + csvRows;

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "student_balances_report.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report. Please try again.");
    }
  };

  // Function to apply a fine to a student
  const applyFine = async (studentId, amount) => {
    buttonClickSound.play();
    try {
      const parsedAmount = parseFloat(amount.trim());
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        alert("Please enter a valid positive number for the fine amount.");
        return;
      }

      const deductionAmount = -parsedAmount;
      const response = await fetch(`/api/students/${studentId}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: deductionAmount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to apply fine");
      }

      const updatedStudent = await response.json();
      setStudents(students.map((student) =>
        student._id === updatedStudent._id ? updatedStudent : student
      ));

      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: studentId,
          type: "Spent",
          amount: parsedAmount,
          description: `Fine applied by teacher`,
        }),
      });

      alert(`Fine of ${parsedAmount} Moolah applied successfully!`);
      document.getElementById("fineAmount").value = "";
    } catch (err) {
      console.error("Error applying fine:", err);
      alert(err.message);
    }
  };

  const handleTaskApproval = async (taskId, status, comment) => {
    buttonClickSound.play();
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
      setPendingTasks(pendingTasks.filter((task) => task._id !== updatedTask._id));
      setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
      setSelectedTask(null);
      setApprovalComment("");
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  // Fetch background image from the backend
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await fetch("https://moolandia-mern-app.onrender.com/api/season-images");
        const data = await response.json();
        if (data.success && data.images.length > 0) {
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

  if (!students || !tasks) {
    return <div>Loading...</div>;
  }

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

        {/* Class Section */}
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
            Manage Classes
          </h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="New Class Name"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                flex: "1",
                backgroundColor: "#fef3c7",
              }}
            />
            <button
              onClick={createClass}
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
              🎓 Create Class
            </button>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <h4
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#78350f",
              }}
            >
              Existing Classes
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  style={{
                    backgroundColor: "#fef3c7",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "2px solid #fbbf24",
                    cursor: "pointer",
                  }}
                  onClick={() => fetchStudentsInClass(cls._id)}
                >
                  <div>
                    <span style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                      {cls.name}
                    </span>
                    <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      {cls.students.length} Students
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteClass(cls._id);
                    }}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>

            {selectedClassDetails && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "2rem",
                    borderRadius: "0.5rem",
                    width: "80%",
                    maxWidth: "800px",
                    maxHeight: "90vh",
                    overflowY: "auto",
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
                    Students
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {selectedClassDetails.students.map((student) => (
                      <div
                        key={student._id}
                        style={{
                          backgroundColor: "#fef3c7",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <p style={{ fontSize: "1rem", fontWeight: "600" }}>
                          {student.name}
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                          Level {student.level}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedClassDetails(null)}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      marginTop: "1rem",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Class Assigning Section */}
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
            Assign Students to Class
          </h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <select
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                flex: "1",
                backgroundColor: "#fef3c7",
              }}
            >
              <option value="">Select a Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <select
              multiple
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                flex: "1",
                backgroundColor: "#fef3c7",
                height: "150px",
              }}
            >
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} (Level {student.level})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const selectedStudents = Array.from(
                  document.querySelector("select[multiple]").selectedOptions
                ).map((option) => option.value);
                if (selectedClass && selectedStudents.length > 0) {
                  selectedStudents.forEach((studentId) => {
                    assignStudentToClass(studentId, selectedClass);
                  });
                  alert("Students assigned to class successfully!");
                } else {
                  alert("Please select a class and at least one student.");
                }
              }}
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
              🚀 Assign to Class
            </button>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#4b5563", marginTop: "0.5rem" }}>
            Hold <strong>Ctrl</strong> (Windows/Linux) or <strong>Cmd</strong> (Mac) to select multiple students.
          </p>
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
              multiple
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                flex: "1",
                backgroundColor: "#fef3c7",
                height: "150px",
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
          <p style={{ fontSize: "0.875rem", color: "#4b5563", marginTop: "0.5rem" }}>
            Hold <strong>Ctrl</strong> (Windows/Linux) or <strong>Cmd</strong> (Mac) to select multiple students.
          </p>
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
                    <span style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                      {task.name}
                    </span>
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
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
    }}
  >
    <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#78350f" }}>
      Student Balances Report
    </h3>
    <button
      onClick={generateBalancesReport}
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
      📊 Download Balances Report
    </button>
  </div>
  {/* Updated Grid Container with Scrolling */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)", // Always 3 columns per row
      gap: "1rem",
      maxHeight: "400px", // Adjust this height based on your card dimensions (approx. 2 rows)
      overflowY: "auto", // Enables vertical scrolling when there are more than 6 students
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
          cursor: "pointer",
        }}
        onClick={() => handleStudentClick(student._id)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.5rem" }}>{student.icon}</span>
          <div>
            <span style={{ fontSize: "1.125rem", fontWeight: "600" }}>
              {student.name}
            </span>
            <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
              Level {student.level}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#15803d" }}>
            {student.balance} Moolah
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteStudent(student._id);
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
            🗑️ Delete
          </button>
        </div>
      </div>
    ))}
  </div>
</div>


        {/* Student Details Modal */}
        {selectedStudent && studentDetails && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                width: "80%",
                maxWidth: "800px",
                maxHeight: "90vh",
                overflowY: "auto",
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
                Student Details: {studentDetails.name}
              </h3>
              <div style={{ marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#78350f" }}>
                  Balance
                </h4>
                <p style={{ fontSize: "1.125rem", color: "#15803d" }}>
                  {studentDetails.balance} Moolah
                </p>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#78350f" }}>
                  Cow Icon
                </h4>
                {studentDetails.cowIcon ? (
                  <img
                    src={studentDetails.cowIcon}
                    alt="Cow Icon"
                    style={{ width: "100px", height: "100px" }}
                  />
                ) : (
                  <p>No cow icon selected.</p>
                )}
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#78350f" }}>
                  Transactions
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {studentDetails.transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      style={{
                        backgroundColor: "#fef3c7",
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p style={{ fontSize: "1rem", fontWeight: "600" }}>
                        {transaction.type}: {transaction.amount} Moolah
                      </p>
                      <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                        {transaction.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#78350f" }}>
                  Tasks
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {studentDetails.tasks.map((task) => (
                    <div
                      key={task._id}
                      style={{
                        backgroundColor: "#fef3c7",
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p style={{ fontSize: "1rem", fontWeight: "600" }}>{task.name}</p>
                      <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                        Reward: {task.reward} Moolah
                      </p>
                      <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                        Status: {task.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={closeStudentDetails}
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Level Configuration Section */}
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
            Level Configuration
          </h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <input
              type="number"
              name="level"
              placeholder="Level"
              value={newLevelConfig.level}
              onChange={handleLevelConfigChange}
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                width: "100px",
                backgroundColor: "#fef3c7",
              }}
            />
            <input
              type="number"
              name="tasksRequired"
              placeholder="Tasks Required"
              value={newLevelConfig.tasksRequired}
              onChange={handleLevelConfigChange}
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                width: "150px",
                backgroundColor: "#fef3c7",
              }}
            />
            <input
              type="number"
              name="reward"
              placeholder="Reward (Moolah)"
              value={newLevelConfig.reward}
              onChange={handleLevelConfigChange}
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                width: "150px",
                backgroundColor: "#fef3c7",
              }}
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={newLevelConfig.description}
              onChange={handleLevelConfigChange}
              style={{
                border: "1px solid #e5e7eb",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                flex: "1",
                backgroundColor: "#fef3c7",
              }}
            />
            <button
              onClick={saveLevelConfig}
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
              Save Level
            </button>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <h4
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#78350f",
              }}
            >
              Current Level Configurations
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1rem",
              }}
            >
              {levelConfigs.map((config) => (
                <div
                  key={config.level}
                  style={{
                    backgroundColor: "#fef3c7",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    border: "2px solid #fbbf24",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <h4 style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                      Level {config.level}
                    </h4>
                    <button
                      onClick={() => deleteLevelConfig(config.level)}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.5rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                    <p>Tasks Required: {config.tasksRequired}</p>
                    <p>Reward: {config.reward} Moolah</p>
                    <p>Description: {config.description}</p>
                  </div>
                </div>
              ))}
            </div>
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
                  <div>
                    <span style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#15803d" }}>
                      {item.price} Moolah
                    </span>
                  </div>
                  <button
                    onClick={() => deleteMarketplaceItem(item._id)}
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
              id="studentSelect"
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
              id="fineAmount"
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
                const studentId = document.getElementById("studentSelect").value;
                const amount = document.getElementById("fineAmount").value;
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

        {/* Manage Seasons Section */}
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
            Manage Seasons
          </h3>
          <button
            onClick={() => {
              // Navigate to the /seasonselector route
              window.location.href = "/seasonselector";
            }}
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
            Go to Season Selector
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
