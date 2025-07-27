import React from "react";
import { Button, Card } from "react-bootstrap";
import { PersonPlusFill } from "react-bootstrap-icons";

const EmployeesContent = ({ setShowEmployeeModal }) => {
  return (
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
};

export default EmployeesContent;