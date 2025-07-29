import React, { useState } from "react";
import { Button } from "react-bootstrap";
import TaskProgressModal from "../../pages/Tasks/Employee/TaskProgressModal";

const EmployeeDashboard = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container mt-5">
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Update Task Progress
      </Button>

      <TaskProgressModal
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default EmployeeDashboard;
