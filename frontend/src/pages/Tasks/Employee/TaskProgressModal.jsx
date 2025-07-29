import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Alert,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import axios from "axios";

const TaskProgressModal = ({ show, handleClose }) => {
  const [taskId, setTaskId] = useState("");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(
        `${BASE_URL}backend/api/tasks/employee/update_progress.php`,
        {
          task_id: taskId,
          progress_percent: progress,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setMessage({ type: "success", text: response.data.message });
        setTimeout(() => {
          handleClose(); 
        }, 1000);
      } else {
        setMessage({ type: "danger", text: response.data.message });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Server Error: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setTaskId("");
    setProgress(0);
    setMessage({ type: "", text: "" });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Task Progress</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {message.text && (
            <Alert variant={message.type}>{message.text}</Alert>
          )}

          <Form.Group className="mb-3" controlId="taskId">
            <Form.Label>Task ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter task ID"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="progress">
            <Form.Label>Progress: {progress}%</Form.Label>
            <Form.Range
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
            />
            <ProgressBar now={progress} label={`${progress}%`} />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskProgressModal;
