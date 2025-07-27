import React from "react";
import { Nav, Col } from "react-bootstrap";
import {
  GearFill,
  PeopleFill,
  FolderFill,
  HouseFill,
  CashStack,
} from "react-bootstrap-icons";

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
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
  );
};

export default Sidebar;