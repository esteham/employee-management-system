import React from 'react';

const EmployeeDashboard = () => {
  return (
    <div className="container mt-5">
      <h2>👨‍💼 Employee Dashboard</h2>
      <p>Welcome, Employee! Here's your dashboard.</p>

      {/* Employee-specific actions */}
      <ul>
        <li>View Payslip</li>
        <li>Submit Leave Application</li>
        <li>Update Profile</li>
      </ul>
    </div>
  );
};

export default EmployeeDashboard;
