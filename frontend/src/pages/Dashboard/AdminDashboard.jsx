import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Tabs,
} from "react-bootstrap";
import {
  GearFill,
  PeopleFill,
  FolderFill,
  PersonPlusFill,
  PlusCircleFill,
  HouseFill,
  CashStack,
} from "react-bootstrap-icons";
import EmployeeRegistrationModal from "../../pages/Employee/EmployeeRegistrationModal";
import GroupCreateModal from "../Groups/GroupCreateModal";
import ViewPayroll from "../../pages/Payroll/ViewPayroll";
import "../../assets/css/AdminDashboard.css";

const AdminDashboard = () => {
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const apiURL = import.meta.env.VITE_API_URL;

  // Tab content components
  const DashboardContent = () => (
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
                <li className="mb-2">
                  <PeopleFill className="me-2" /> Manage Employees
                </li>
                <li className="mb-2">
                  <FolderFill className="me-2" /> View Reports
                </li>
                <li>
                  <GearFill className="me-2" /> System Settings
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const EmployeesContent = () => (
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
      <Card>
        <Card.Body>
          <p>Employee list and management tools would appear here.</p>
        </Card.Body>
      </Card>
    </div>
  );

  const GroupsContent = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      axios
        .get(`${apiURL}backend/api/groups/view.php`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.success) {
            setGroups(res.data.groups);
          } else {
            console.error("Failed to fetch groups:", res.data.message);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error:", err);
          setLoading(false);
        });
    }, []);

    return (
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

        {loading ? (
          <p>Loading groups...</p>
        ) : (
          <Row>
            {groups.length > 0 ? (
              groups.map((group) => (
                <Col md={6} key={group.group_id} className="mb-4">
                  <Card>
                    <Card.Body>
                      <Card.Title>{group.group_name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        Created by: {group.created_ay} <br />
                        On: {new Date(group.created_at).toLocaleDateString()}
                      </Card.Subtitle>
                      <Card.Text>{group.description}</Card.Text>
                      <strong>Members:</strong>
                      <ul>
                        {group.members.map((member) => (
                          <li key={member.id}>
                            {member.first_name} ({member.email})
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p>No groups found.</p>
            )}
          </Row>
        )}
      </div>
    );
  };

  const PayrollContent = () => (
    <div>
      <h2 className="mb-4">Payroll Management</h2>
      <ViewPayroll />
    </div>
  );

  const SettingsContent = () => (
    <div>
      <h2 className="mb-4">System Settings</h2>
      <Card>
        <Card.Body>
          <p>System configuration options would appear here.</p>
        </Card.Body>
      </Card>
    </div>
  );

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
                active={activeTab === "dashboard"}
                onClick={() => setActiveTab("dashboard")}
                className="d-flex align-items-center"
              >
                <HouseFill className="me-2" /> Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === "employees"}
                onClick={() => setActiveTab("employees")}
                className="d-flex align-items-center"
              >
                <PeopleFill className="me-2" /> Employees
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === "groups"}
                onClick={() => setActiveTab("groups")}
                className="d-flex align-items-center"
              >
                <FolderFill className="me-2" /> Groups
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === "payroll"}
                onClick={() => setActiveTab("payroll")}
                className="d-flex align-items-center"
              >
                <CashStack className="me-2" /> Payroll
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
                className="d-flex align-items-center"
              >
                <GearFill className="me-2" /> Settings
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        {/* Main Content */}
        <Col md={9} lg={10} className="main-content p-4">
          {activeTab === "dashboard" && <DashboardContent />}
          {activeTab === "employees" && <EmployeesContent />}
          {activeTab === "groups" && <GroupsContent />}
          {activeTab === "payroll" && <PayrollContent />}
          {activeTab === "settings" && <SettingsContent />}

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
