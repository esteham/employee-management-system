import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginFetch = () => {
  const navigate = useNavigate(); //Navigation hook
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const apiURL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiURL}backend/api/auth/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (data.success) {
        login({ username: username, role: data.role });
        navigate(
          data.role === "admin"
            ? "/AdminDashboard"
            : data.role === "hr"
            ? "/HrDashboard"
            : data.role === "employee"
            ? "/EmployeeDashboard"
            : "/"
        );
      } else {
        setError(data.message);
        setSuccess("");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setSuccess("");
    }
  };

  return (
    <Card className="mt-4 p-4 mx-auto" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-3">Login</h3>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="loginEmail">
          <Form.Label>Email Address / Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="loginPassword" className="mt-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-4 w-100">
          Login
        </Button>
      </Form>
    </Card>
  );
};

export default LoginFetch;
