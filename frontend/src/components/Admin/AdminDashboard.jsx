import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import Sidebar from "./Sidebar";
import DashboardContent from "./DashboardContent";
import EmployeesContent from "./EmployeesContent";
import GroupsContent from "./GroupsContent";
import PayrollContent from "./PayrollContent";
import SettingsContent from "./SettingsContent";
import EmployeeRegistrationModal from "../../pages/Employee/EmployeeRegistrationModal";
import GroupCreateModal from "../../pages/Groups/GroupCreateModal";
import GroupEditModal from "../../pages/Groups/GroupEditModal";
import "../../assets/css/AdminDashboard.css";

import ErrorBoundary from "../ErrorBoundary";

const AdminDashboard = () => {
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editModalShow, setEditModalShow] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const apiURL = import.meta.env.VITE_API_URL;

  const fetchGroups = () => {
    setLoadingGroups(true);
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
        setLoadingGroups(false);
      })
      .catch((err) => {
        console.error("Error fetching groups:", err);
        setLoadingGroups(false);
      });
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDeleteGroup = async (id) => {
    if (!window.confirm("Are you sure to delete this group?")) return;

    try {
      const res = await axios.post(`${apiURL}backend/api/groups/delete.php`, {
        group_id: id,
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (res.data.success) {
        const updated = groups.filter(group => group.group_id !== id);
        setGroups(updated);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <Container fluid className="admin-dashboard">
      <Row>
        <ErrorBoundary>
  <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
</ErrorBoundary>
        
        <Col md={9} lg={10} className="main-content p-4">
          {activeTab === "dashboard" && (
            <DashboardContent 
              setShowEmployeeModal={setShowEmployeeModal}
              setShowGroupModal={setShowGroupModal}
            />
          )}
          {activeTab === "employees" && (
            <EmployeesContent setShowEmployeeModal={setShowEmployeeModal} />
          )}
          {activeTab === "groups" && (
            <GroupsContent
              groups={groups}
              loadingGroups={loadingGroups}
              setShowGroupModal={setShowGroupModal}
              setSelectedGroup={setSelectedGroup}
              setEditModalShow={setEditModalShow}
              handleDeleteGroup={handleDeleteGroup}
            />
          )}
          {activeTab === "payroll" && <PayrollContent />}
          {activeTab === "settings" && <SettingsContent />}

          <EmployeeRegistrationModal
            show={showEmployeeModal}
            handleClose={() => setShowEmployeeModal(false)}
          />
          <GroupCreateModal
            show={showGroupModal}
            handleClose={() => setShowGroupModal(false)}
          />
          {selectedGroup && (
            <GroupEditModal
              show={editModalShow}
              handleClose={() => setEditModalShow(false)}
              groupData={selectedGroup}
              refreshGroups={fetchGroups}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;