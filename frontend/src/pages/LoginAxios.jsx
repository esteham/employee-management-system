import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/loginHandler";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await loginUser(username, password);

    if (data.success) {
      setSuccess(data.message);
      setError("");
      navigate("/"); 
    } else {
      setError(data.message);
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
          <Form.Label>Username or Email</Form.Label>
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

export default Login;
