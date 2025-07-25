import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="container mt-5">
      <h2>🛡️ Admin Dashboard</h2>
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
