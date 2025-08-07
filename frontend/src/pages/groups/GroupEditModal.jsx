import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Form,
  FloatingLabel,
  Alert,
  Badge,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import { XCircle, PlusCircle, CheckCircle, X } from "react-bootstrap-icons";

const GroupEditModal = ({ show, handleClose, groupData, refreshGroups }) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [employeeFields, setEmployeeFields] = useState([]);
  const [response, setResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (show && groupData) {
      resetForm();
      fetchDepartments();

      setGroupName(groupData.group_name || "");
      setDescription(groupData.description || "");
      setSelectedDepartment(groupData.department_id || "");

      const initialFields = groupData.members?.map((member) => ({
        value: `${member.id} - ${member.first_name} ${member.last_name}`,
        selectedId: member.id,
        suggestions: [],
      })) || [];

      setEmployeeFields(initialFields.length ? initialFields : [{ value: "", selectedId: null, suggestions: [] }]);
    }
  }, [show, groupData]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}backend/api/department/fetctDepartment.php`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  useEffect(() => {
    if (selectedDepartment) {
      setLoadingEmployees(true);
      axios
        .post(
          `${BASE_URL}backend/api/employees/fetchByDepartment.php`,
          { department_id: selectedDepartment },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        )
        .then((res) => {
          setDepartmentEmployees(res.data.success ? res.data.employees : []);
        })
        .catch((err) => {
          console.error("Failed to fetch employees by department:", err);
          setDepartmentEmployees([]);
        })
        .finally(() => {
          setLoadingEmployees(false);
        });
    } else {
      setDepartmentEmployees([]);
    }
  }, [selectedDepartment]);

  const handleEmployeeChange = (index, input) => {
    const updated = [...employeeFields];
    updated[index].value = input;
    updated[index].selectedId = null;

    updated[index].suggestions = departmentEmployees.filter((emp) => {
      const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
      return (
        emp.id?.toString().includes(input.toLowerCase()) ||
        fullName.includes(input.toLowerCase())
      );
    });

    setEmployeeFields(updated);
  };

  const selectSuggestion = (index, emp) => {
    const updated = [...employeeFields];
    updated[index].value = `${emp.id} - ${emp.first_name} ${emp.last_name}`;
    updated[index].selectedId = emp.id;
    updated[index].suggestions = [];
    setEmployeeFields(updated);
  };

  const addEmployeeField = () => {
    setEmployeeFields([
      ...employeeFields,
      { value: "", selectedId: null, suggestions: [] },
    ]);
  };

  const removeEmployeeField = (index) => {
    if (employeeFields.length > 1) {
      const updated = [...employeeFields];
      updated.splice(index, 1);
      setEmployeeFields(updated);
    }
  };

  const resetForm = () => {
    setGroupName("");
    setDescription("");
    setSelectedDepartment("");
    setEmployeeFields([{ value: "", selectedId: null, suggestions: [] }]);
    setResponse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      group_id: groupData.group_id,
      group_name: groupName.trim(),
      description: description.trim(),
      employee_ids: employeeFields
        .map((e) => e.selectedId)
        .filter((id) => !!id),
    };

    try {
      const res = await axios.post(
        `${BASE_URL}backend/api/groups/edit.php`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setResponse(res.data);
      if (res.data.success) {
        if (refreshGroups) refreshGroups();
        setTimeout(() => handleClose(), 2000);
      }
    } catch (error) {
      setResponse({
        success: false,
        message: error.response?.data?.message || "Network error",
        error: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    resetForm();
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h5 fw-bold">Edit Group</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <FloatingLabel controlId="groupName" label="Group Name" className="mb-3">
            <Form.Control
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              autoFocus
            />
          </FloatingLabel>

          <FloatingLabel controlId="description" label="Description" className="mb-3">
            <Form.Control
              as="textarea"
              placeholder="Enter description"
              style={{ height: "100px" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FloatingLabel>

          {/* Department Selection - Disabled */}
          <Form.Group className="mb-3">
            <Form.Label>Department</Form.Label>
            <Form.Control
              as="select"
              value={selectedDepartment}
              disabled
            >
              <option value="">Select a department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Form.Control>
            <Form.Text className="text-muted">
              Department cannot be changed for an existing group
            </Form.Text>
          </Form.Group>

          {/* Employee Section */}
          {selectedDepartment && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="fw-semibold">Employees</Form.Label>
                <Badge bg="light" text="dark" className="rounded-pill">
                  {employeeFields.filter((e) => e.selectedId !== null).length} selected
                </Badge>
              </div>

              {loadingEmployees ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <span className="ms-2">Loading employees...</span>
                </div>
              ) : departmentEmployees.length > 0 ? (
                <>
                  <div className="mb-3">
                    <h6 className="small fw-bold mb-2">
                      Available in {departments.find(d => d.id === selectedDepartment)?.name}:
                    </h6>
                    <div
                      className="border rounded p-2 mb-3 bg-light"
                      style={{ maxHeight: "150px", overflowY: "auto" }}
                    >
                      {departmentEmployees.map((emp) => {
                        const isAdded = employeeFields.some(f => f.selectedId === emp.id);
                        return (
                          <div
                            key={emp.id}
                            className={`py-1 px-2 small d-flex justify-content-between align-items-center ${isAdded ? 'text-muted' : ''}`}
                          >
                            <span>{emp.id} - {emp.first_name} {emp.last_name}</span>
                            {isAdded ? (
                              <Badge bg="success" className="rounded-pill">Added</Badge>
                            ) : (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  const emptyIndex = employeeFields.findIndex(f => !f.selectedId);
                                  if (emptyIndex >= 0) {
                                    selectSuggestion(emptyIndex, emp);
                                  } else {
                                    addEmployeeField();
                                    setTimeout(() => {
                                      const newIndex = employeeFields.length;
                                      selectSuggestion(newIndex, emp);
                                    }, 0);
                                  }
                                }}
                              >
                                Add
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Employees */}
                  <h6 className="small fw-bold mb-2">Selected Employees:</h6>
                  {employeeFields.map((field, index) => (
                    <div key={index} className="mb-3 position-relative">
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          placeholder={`Search employee #${index + 1}`}
                          value={field.value}
                          onChange={(e) =>
                            handleEmployeeChange(index, e.target.value)
                          }
                          autoComplete="off"
                          className="flex-grow-1"
                        />
                        <Button
                          variant="outline-danger"
                          onClick={() => removeEmployeeField(index)}
                          className="ms-2"
                          disabled={employeeFields.length <= 1}
                        >
                          <XCircle />
                        </Button>
                      </div>

                      {/* Suggestions */}
                      {field.suggestions.length > 0 && (
                        <ListGroup
                          className="position-absolute w-100 shadow zindex-tooltip"
                          style={{ zIndex: 999 }}
                        >
                          {field.suggestions.slice(0, 5).map((emp) => (
                            <ListGroup.Item
                              key={emp.id}
                              action
                              onClick={() => selectSuggestion(index, emp)}
                              className="small"
                            >
                              {emp.id} - {emp.first_name} {emp.last_name}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline-primary"
                    onClick={addEmployeeField}
                    className="w-100 mt-2 d-flex align-items-center justify-content-center"
                  >
                    <PlusCircle className="me-2" />
                    Add Another Employee Field
                  </Button>
                </>
              ) : (
                <Alert variant="info" className="small">
                  No employees found in this department.
                </Alert>
              )}
            </div>
          )}

          {response && (
            <Alert variant={response.success ? "success" : "danger"} className="d-flex align-items-center">
              {response.success ? <CheckCircle className="me-2" /> : <X className="me-2" />}
              <div>
                <Alert.Heading className="h6 mb-1">
                  {response.success ? "Success!" : "Error!"}
                </Alert.Heading>
                <p className="mb-0 small">{response.message}</p>
              </div>
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                "Update Group"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default GroupEditModal;