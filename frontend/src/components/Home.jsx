import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Home = () => {
  return (
    <Container className="mt-5">
      <div className="text-center mb-4">
        <h1>👋 Welcome to the Employee Management System</h1>
        <p className="lead">
          A simple and powerful platform to manage employees, HR activities, and administrative tasks efficiently.
        </p>
      </div>

      <Row>
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>👨‍💼 Employee Dashboard</Card.Title>
              <Card.Text>
                View your profile, download payslips, and apply for leave directly from your dashboard.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>👔 HR Panel</Card.Title>
              <Card.Text>
                Manage employee data, attendance, and recruitment from one central location.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>🛡️ Admin Control</Card.Title>
              <Card.Text>
                Full system control including role management, data backups, and system settings.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
