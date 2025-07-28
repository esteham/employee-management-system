import React, { useEffect, useState } from "react";
import axios from "axios";

const TaskAssignment = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNote, setTaskNote] = useState("");
  const [deadline, setDeadline] = useState("");
  const [taskFiles, setTaskFiles] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // API base URL (adjust as needed)
  const apiURL = import.meta.env.VITE_API_URL;

  // Load all groups on mount
  useEffect(() => {
    axios
      .get(`${apiURL}backend/api/groups/fetchAllGroups.php`, { 
        withCredentials: true 
        })
      .then((res) => {
        if (res.data.success) {
          setGroups(res.data.groups);
        } else {
          setMessage({ type: "error", text: res.data.message });
        }
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load groups" });
      });
  }, []);

  // Load employees when group changes
  useEffect(() => {
    if (!selectedGroup) {
      setEmployees([]);
      setSelectedEmployees([]);
      return;
    }
    axios
      .post(
        `${apiURL}backend/api/employees/fetchGroupEmployees.php`,
        { group_id: selectedGroup },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data.success) {
          setEmployees(res.data.employees);
        } else {
          setEmployees([]);
          setMessage({ type: "error", text: res.data.message });
        }
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load employees" });
      });
  }, [selectedGroup]);

  // Handle employee selection toggle
  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  // Handle file input change
  const onFileChange = (e) => {
    setTaskFiles(e.target.files);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGroup || selectedEmployees.length === 0 || !taskTitle || !deadline) {
      setMessage({ type: "error", text: "All required fields must be filled" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("group_id", selectedGroup);
      selectedEmployees.forEach((id) => formData.append("employee_ids[]", id));
      formData.append("task_title", taskTitle);
      formData.append("task_note", taskNote);
      formData.append("deadline", deadline);

      for (let i = 0; i < taskFiles.length; i++) {
        formData.append("task_files[]", taskFiles[i]);
      }

      const res = await axios.post(`${apiURL}backend/api/tasks/assign.php`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setMessage({ type: "success", text: res.data.message });
        // reset form
        setSelectedGroup("");
        setEmployees([]);
        setSelectedEmployees([]);
        setTaskTitle("");
        setTaskNote("");
        setDeadline("");
        setTaskFiles([]);
      } else {
        setMessage({ type: "error", text: res.data.message || "Failed to assign task" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Assign New Task</h2>

      {message && (
        <div
          style={{
            marginBottom: 10,
            padding: 10,
            borderRadius: 4,
            color: message.type === "error" ? "red" : "green",
            border: `1px solid ${message.type === "error" ? "red" : "green"}`,
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Select Group<span style={{ color: "red" }}> *</span>
            <br />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              required
            >
              <option value="">-- Select Group --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {employees.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <label>
              Select Employees<span style={{ color: "red" }}> *</span>
            </label>
            <div
              style={{
                maxHeight: 150,
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: 5,
              }}
            >
              {employees.map((emp) => (
                <div key={emp.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                    />{" "}
                    {emp.first_name} {emp.last_name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 10 }}>
          <label>
            Task Title<span style={{ color: "red" }}> *</span>
            <br />
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Task Note
            <br />
            <textarea
              value={taskNote}
              onChange={(e) => setTaskNote(e.target.value)}
              rows={3}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Deadline<span style={{ color: "red" }}> *</span>
            <br />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Attach Files
            <br />
            <input type="file" multiple onChange={onFileChange} />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Assigning..." : "Assign Task"}
        </button>
      </form>
    </div>
  );
};

export default TaskAssignment;
