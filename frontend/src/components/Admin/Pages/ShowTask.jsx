/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert, Badge } from "react-bootstrap";
import axios from "axios";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("/api/tasks/get_tasks.php", {
        withCredentials: true, // for session cookies
      });

      if (response.data.success) {
        setTasks(response.data.data);
      } else {
        setError(response.data.message || "Failed to load tasks");
      }
    } catch (err) {
      setError("Error fetching tasks: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" /> Loading tasks...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4">
        {error}
      </Alert>
    );
  }

  return (
    <div className="container mt-4">
      <h3>📋 Task Assignments</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Note</th>
            <th>Deadline</th>
            <th>Assigned At</th>
            <th>Group</th>
            <th>Employee</th>
            <th>Email</th>
            <th>Files</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.task_id}>
                <td>{task.title}</td>
                <td>{task.note || "—"}</td>
                <td>
                  <Badge bg="warning">{task.deadline}</Badge>
                </td>
                <td>{task.assigned_at}</td>
                <td>{task.group_name}</td>
                <td>{task.employee_name}</td>
                <td>{task.employee_email}</td>
                <td>
                  {task.files && task.files.length > 0 ? (
                    task.files.map((file, index) => (
                      <a
                        key={index}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-block"
                      >
                        File {index + 1}
                      </a>
                    ))
                  ) : (
                    "No Files"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No tasks found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TaskList;
