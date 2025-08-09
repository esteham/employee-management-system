import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Badge } from "react-bootstrap";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${BASE_URL}backend/api/tasks/admin/list.php`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setTasks(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch tasks");
        }
      })
      .catch(() => {
        setError("Server error occurred");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Groupby task
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.group_name]) {
      acc[task.group_name] = [];
    }
    acc[task.group_name].push(task);
    return acc;
  }, {});

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h3 className="mb-4">📋 Assigned Tasks</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Deadline</th>
            <th>Assigned At</th>
            <th>Employee</th>
            <th>Email</th>
            <th>Files</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedTasks).length > 0 ? (
            Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
              <React.Fragment key={groupName}>
                <tr>
                  <td colSpan="6" style={{ backgroundColor: "#d1ecf1" }}>
                    <Badge bg="" text="black" style={{ fontSize: "1rem" }}>
                      {groupName} &nbsp;({groupTasks.length} tasks)
                    </Badge>
                  </td>
                </tr>

                {groupTasks.map((task) => (
                  <tr key={task.task_id}>
                    <td>{task.title}</td>
                    <td>{task.deadline}</td>
                    <td>{task.assigned_at}</td>
                    <td>{task.employee_name}</td>
                    <td>{task.employee_email}</td>
                    <td>
                      {task.files.length > 0 ? (
                        task.files.map((file, index) => (
                          <div key={index}>
                            <a
                              href={`${BASE_URL}backend/api/assets/uploads/tasks/${file}`}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="btn btn-sm btn-primary"
                            >
                              Download
                            </a>
                          </div>
                        ))
                      ) : (
                        <span>No files</span>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TaskList;
