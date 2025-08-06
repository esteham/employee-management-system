/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  InputGroup,
  Table,
  Modal,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { PersonPlusFill } from "react-bootstrap-icons";
import axios from "axios";
import * as XLSX from "xlsx";

const EmployeesContent = ({ setShowEmployeeModal }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsModalShow, setDetailsModalShow] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [deptEmployeeCount, setDeptEmployeeCount] = useState(null);
  const [editModalShow, setEditModalShow] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}backend/api/employees/view.php`, {
        withCredentials: true,
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
        `${BASE_URL}backend/api/employees/delete.php`,
        { id },
        {
          headers: { "Content-Type": "multipart/form-data" },
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

  const fetchDepartments = () => {
    axios
      .get(`${BASE_URL}backend/api/department/fetctDepartment.php`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setDepartments(res.data.departments);
        }
      });
  };

  // When a department is selected, fetch employees for that department
  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setSelectedDept(deptId);
    if (!deptId) {
      setDeptEmployeeCount(null);
      fetchEmployees();
      return;
    }

    setLoading(true);
    axios
      .post(
        `${BASE_URL}backend/api/employees/count_by_department.php`,
        { department_id: deptId },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.data.success) {
          setEmployees(res.data.employees);
          setDeptEmployeeCount(res.data.employees.length);
        } else {
          setEmployees([]);
          setDeptEmployeeCount(0);
        }
        setLoading(false);
      })
      .catch(() => {
        setEmployees([]);
        setDeptEmployeeCount(0);
        setLoading(false);
      });
  };

  // search filter
  const filteredEmployees = employees.filter(
    (e) =>
      e.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toString().includes(searchTerm)
  );

  // pagination slicing only if department not selected
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = selectedDept
    ? filteredEmployees
    : filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Excel download function
  const downloadExcel = () => {
    const deptName =
      departments.find((d) => d.id == selectedDept)?.name || "Unknown";

    // Header + Sub-header
    const rows = [
      ["Employee List"],
      [`Department: ${deptName}`],
      [],
      ["ID", "Name", "Email", "Phone Number"],
      ...filteredEmployees.map((emp) => [
        emp.id,
        `${emp.first_name} ${emp.last_name}`,
        emp.email,
        emp.phone || "",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Auto width set
    const colWidths = rows[3].map((_, colIndex) => {
      const maxLen = rows.reduce((max, row) => {
        const val = row[colIndex];
        const len = val ? val.toString().length : 0;
        return Math.max(max, len);
      }, 0);
      return { wch: maxLen + 2 };
    });
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    XLSX.writeFile(wb, `Employees_${deptName.replace(/\s+/g, "_")}.xlsx`);
  };

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
      <div className="row mb-3">
        <div className="col-md-6">
          <Form.Group controlId="departmentSelect">
            <Form.Label>Select Department</Form.Label>
            <Form.Select value={selectedDept} onChange={handleDepartmentChange}>
              <option value="">-- Select Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        <div className="col-md-6 d-flex align-items-end">
          <InputGroup>
            <Form.Control
              placeholder="Search by name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>
      {selectedDept && (
        <div className="mb-3">
          <p>
            <strong>Total Employees:</strong> {deptEmployeeCount ?? 0}
          </p>
          <Button
            onClick={downloadExcel}
            variant="success"
            size="sm"
            className="mb-3"
          >
            Download Excel
          </Button>
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <ul>
              {filteredEmployees.map((emp) => (
                <li key={emp.id}>
                  {emp.first_name} {emp.last_name} - {emp.email}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!selectedDept && (
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
                      <th>Image</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEmployees.map((e) => (
                      <tr key={e.id}>
                        <td>{e.id}</td>
                        <td>
                          {e.image ? (
                            <img
                              src={`${BASE_URL}backend/assets/uploads/employee/${e.image}`}
                              alt={`${e.first_name} ${e.last_name}`}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            "No Image"
                          )}
                        </td>
                        <td>
                          {e.first_name} {e.last_name}
                        </td>
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
                          <Button
                            size="sm"
                            variant="warning"
                            className="me-2"
                            onClick={() => {
                              setEditEmployeeData(e);
                              setEditModalShow(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(e.id)}
                          >
                            Delete
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
      )}

      {/* Details Modal */}
      <Modal show={detailsModalShow} onHide={() => setDetailsModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <>
              <p>
                <strong>Name :</strong> {selectedEmployee.first_name}{" "}
                {selectedEmployee.last_name}
              </p>
              <p>
                <strong>Email :</strong> {selectedEmployee.email}
              </p>
              <p>
                <strong>Phone :</strong> {selectedEmployee.phone}
              </p>
              <p>
                <strong>Role :</strong> {selectedEmployee.user_role}
              </p>
              <p>
                <strong>Department:</strong> {selectedEmployee.department_name}
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
      <Modal show={editModalShow} onHide={() => setEditModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editEmployeeData && (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData();

                formData.append("id", editEmployeeData.id);
                formData.append("first_name", e.target.first_name.value);
                formData.append("last_name", e.target.last_name.value);
                formData.append("email", e.target.email.value);
                formData.append("phone", e.target.phone.value);
                formData.append("address", e.target.address.value);
                formData.append(
                  "emergency_name",
                  e.target.emergency_name.value
                );
                formData.append(
                  "emergency_phone",
                  e.target.emergency_phone.value
                );
                formData.append(
                  "emergency_relation",
                  e.target.emergency_relation.value
                );
                formData.append("department_id", e.target.department_id.value);

                if (selectedImage) {
                  formData.append("image", selectedImage);
                }

                axios
                  .post(
                    `${BASE_URL}backend/api/employees/update.php`,
                    formData,
                    {
                      withCredentials: true,
                    }
                  )
                  .then((res) => {
                    if (res.data.success) {
                      fetchEmployees();
                      setEditModalShow(false);
                    } else {
                      alert(res.data.message);
                    }
                  })
                  .catch((err) => {
                    console.error("Update failed", err);
                  });
              }}
            >
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  name="first_name"
                  defaultValue={editEmployeeData.first_name}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  name="last_name"
                  defaultValue={editEmployeeData.last_name}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  defaultValue={editEmployeeData.email}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  name="phone"
                  defaultValue={editEmployeeData.phone}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  name="address"
                  as="textarea"
                  rows={2}
                  defaultValue={editEmployeeData.address}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Emergency Contact Name</Form.Label>
                <Form.Control
                  name="emergency_name"
                  defaultValue={editEmployeeData.emergency_name}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Emergency Contact Phone</Form.Label>
                <Form.Control
                  name="emergency_phone"
                  defaultValue={editEmployeeData.emergency_phone}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Emergency Contact Relation</Form.Label>
                <Form.Control
                  name="emergency_relation"
                  defaultValue={editEmployeeData.emergency_relation}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  name="department_id"
                  defaultValue={editEmployeeData.department_id}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="formImage" className="mb-3">
                <Form.Label>Profile Image</Form.Label>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      display: "block",
                      marginBottom: "10px",
                    }}
                  />
                ) : editEmployeeData.image ? (
                  <img
                    src={`${BASE_URL}backend/assets/uploads/employee/${editEmployeeData.image}`}
                    alt="Current"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      display: "block",
                      marginBottom: "10px",
                    }}
                  />
                ) : null}

                <Form.Control
                  type="file"
                  accept="image/*"
                  name="image"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setSelectedImage(file);
                    setPreviewImage(URL.createObjectURL(file));
                  }}
                />
              </Form.Group>

              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeesContent;
