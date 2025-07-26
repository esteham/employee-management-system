import React, { useState } from 'react';
import { Button, Container, Row, Col, Card, Nav } from 'react-bootstrap';
import { 
  GearFill, 
  PeopleFill, 
  FolderFill, 
  PersonPlusFill, 
  PlusCircleFill,
  HouseFill
} from 'react-bootstrap-icons';
import EmployeeRegistrationModal from '../../pages/Employee/EmployeeRegistrationModal';
import GroupCreateModal from '../../pages/groups/GroupCreateModal';
import '../../assets/css/AdminDashboard.css';

const AdminDashboard = () => {
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Container fluid className="admin-dashboard">
      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2} className="sidebar px-0">
          <div className="sidebar-header p-3">
            <h4 className="text-white">🛡️ Admin Panel</h4>
          </div>
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
                className="d-flex align-items-center"
              >
                <HouseFill className="me-2" /> Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'employees'} 
                onClick={() => setActiveTab('employees')}
                className="d-flex align-items-center"
              >
                <PeopleFill className="me-2" /> Employees
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'groups'} 
                onClick={() => setActiveTab('groups')}
                className="d-flex align-items-center"
              >
                <FolderFill className="me-2" /> Groups
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')}
                className="d-flex align-items-center"
              >
                <GearFill className="me-2" /> Settings
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        {/* Main Content */}
        <Col md={9} lg={10} className="main-content p-4">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="mb-4">Admin Dashboard</h2>
              <Row>
                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>Quick Actions</Card.Title>
                      <Button 
                        variant="primary" 
                        className="me-3 mb-2 d-flex align-items-center"
                        onClick={() => setShowEmployeeModal(true)}
                      >
                        <PersonPlusFill className="me-2" /> Register Employee
                      </Button>
                      <Button 
                        variant="success" 
                        className="d-flex align-items-center"
                        onClick={() => setShowGroupModal(true)}
                      >
                        <PlusCircleFill className="me-2" /> Create Group
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>System Overview</Card.Title>
                      <Card.Text>
                        Welcome back, Admin! You have full access to manage the system.
                      </Card.Text>
                      <ul className="list-unstyled">
                        <li className="mb-2"><PeopleFill className="me-2" /> Manage Employees</li>
                        <li className="mb-2"><FolderFill className="me-2" /> View Reports</li>
                        <li><GearFill className="me-2" /> System Settings</li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {activeTab === 'employees' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Employee Management</h2>
                <Button 
                  variant="primary" 
                  onClick={() => setShowEmployeeModal(true)}
                  className="d-flex align-items-center"
                >
                  <PersonPlusFill className="me-2" /> Add Employee
                </Button>
              </div>
              {/* Employee management content would go here */}
              <Card>
                <Card.Body>
                  <p>Employee list and management tools would appear here.</p>
                </Card.Body>
              </Card>
            </div>
          )}

          {activeTab === 'groups' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Group Management</h2>
                <Button 
                  variant="success" 
                  onClick={() => setShowGroupModal(true)}
                  className="d-flex align-items-center"
                >
                  <PlusCircleFill className="me-2" /> Create Group
                </Button>
              </div>
              {/* Group management content would go here */}
              <Card>
                <Card.Body>
                  <p>Group list and management tools would appear here.</p>
                </Card.Body>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="mb-4">System Settings</h2>
              {/* Settings content would go here */}
              <Card>
                <Card.Body>
                  <p>System configuration options would appear here.</p>
                </Card.Body>
              </Card>
            </div>
          )}

          {/* Modals */}
          <EmployeeRegistrationModal
            show={showEmployeeModal}
            handleClose={() => setShowEmployeeModal(false)}
          />
          <GroupCreateModal
            show={showGroupModal}
            handleClose={() => setShowGroupModal(false)}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;