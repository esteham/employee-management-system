import React, { useEffect, useState } from "react";
import { Button, Card, Form, InputGroup, Table, Modal, Spinner, Pagination } from "react-bootstrap";
import { PersonPlusFill, EyeFill, PencilFill, TrashFill } from "react-bootstrap-icons";
import axios from "axios";

const EmployeesContent = ({ setShowEmployeeModal }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsModalShow, setDetailsModalShow] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    setLoading(true);
    axios
      .get(`${apiURL}backend/api/employees/view.php`, { 
        withCredentials: true 
      })
      .then((res) => {
        if (res.data.success) {
          setEmployees(res.data.employees);
        } else {
          alert("Failed to fetch employees.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure to delete this employee?")) return;

    axios
      .post(
        `${apiURL}backend/api/employees/delete.php`,
        { id },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.data.success) {
          setEmployees((prev) => prev.filter((e) => e.id !== id));
        } else {
          alert(res.data.message);
        }
      });
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toString().includes(searchTerm)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

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

      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Search by name or ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      <Card>
        <Card.Body>
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.map((e) => (
                    <tr key={e.id}>
                      <td>{e.id}</td>
                      <td>{e.first_name} {e.last_name}</td>
                      <td>{e.email}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="info"
                          className="me-2"
                          onClick={() => {
                            setSelectedEmployee(e);
                            setDetailsModalShow(true);
                          }}
                        >
                          View
                        </Button>
                        {/* <Button size="sm" variant="warning" className="me-2">
                          Edit
                        </Button> */}
                        <Button size="sm" variant="danger" onClick={() => handleDelete(e.id)}>
                          {/* <TrashFill /> */}Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              <Pagination>
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx}
                    active={idx + 1 === currentPage}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Details Modal */}
      <Modal show={detailsModalShow} onHide={() => setDetailsModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <>
              <p><strong>Name   :</strong> {selectedEmployee.first_name} {selectedEmployee.last_name}</p>
              <p><strong>Email  :</strong> {selectedEmployee.email}</p>
              <p><strong>Phone  :</strong> {selectedEmployee.phone}</p>
              <p><strong>Role   :</strong> {selectedEmployee.user_role}</p>
              <p><strong>Department:</strong> {selectedEmployee.department_name}</p>
              {/* Add more fields if needed */}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeesContent;
