import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import EmployeeRegistrationModal from '../../pages/Employee/EmployeeRegistrationModal';

const AdminDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="container mt-5">
      <h2>🛡️ Admin Dashboard</h2>
      <Button onClick={() => setShowModal(true)}>Register New Employee</Button>
      <EmployeeRegistrationModal show={showModal} handleClose={() => setShowModal(false)} />
      <p>Welcome, Admin! You have full access to the system.</p>

      {/* Admin-specific actions */}
      <ul>
        <li>Manage Employees</li>
        <li>View Reports</li>
        <li>System Settings</li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
