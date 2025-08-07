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
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (show && groupData) {
      resetForm();
      fetchDepartments();
      
      setGroupName(groupData.group_name || "");
      setDescription(groupData.description || "");
      setSelectedDepartment(groupData.department_id || "");
    }
  }, [show, groupData]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchDepartmentEmployees(selectedDepartment);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (show && groupData && selectedDepartment && departmentEmployees.length > 0) {
      // Set initial selected employees from groupData
      const initialSelected = groupData.members?.map(member => ({
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email
      })) || [];
      
      // Ensure all selected employees are valid
      const validSelected = initialSelected.filter(emp =>
        emp.id && emp.first_name && emp.last_name
      );
      
      setSelectedEmployees(validSelected);
    }
  }, [groupData, selectedDepartment, departmentEmployees, show]);

  const resetForm = () => {
    setGroupName("");
    setDescription("");
    setSelectedDepartment("");
    setSelectedEmployees([]);
    setError("");
    setSuccessMessage("");
    setIsSubmitting(false);
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}backend/api/department/fetctDepartment.php`,{
        withCredentials:true,
      });
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchDepartmentEmployees = async (departmentId) => {
    setLoadingEmployees(true);
    try {
      const response = await axios.post(
        `${BASE_URL}backend/api/employees/fetchByDepartment.php`,
        { department_id: departmentId },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      if (response.data.success) {
        setDepartmentEmployees(response.data.employees || []);
      } else {
        setDepartmentEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setDepartmentEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleAddEmployee = (employee) => {
    if (employee.id && employee.first_name && employee.last_name &&
        !selectedEmployees.some(emp => emp.id === employee.id)) {
      setSelectedEmployees(prev => [...prev, employee]);
    }
  };

  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    if (!groupName.trim() || !selectedDepartment) {
      setError("Please provide group name and select department.");
      setIsSubmitting(false);
      return;
    }

    if (selectedEmployees.length === 0) {
      setError("Please select at least one employee.");
      setIsSubmitting(false);
      return;
    }

    const employeeIds = selectedEmployees.map(emp => emp.id);

    try {
      const response = await axios.post(
        `${BASE_URL}backend/api/groups/edit.php`,
        {
          group_id: groupData.group_id,
          group_name: groupName,
          department_id: selectedDepartment,
          description,
          employees: employeeIds,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSuccessMessage("Group updated successfully!");
        refreshGroups();
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        setError(response.data.message || "Failed to update group.");
      }
    } catch (error) {
      console.error("Error updating group:", error);
      setError("An error occurred while updating the group.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get department name for display
  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId || d.id === parseInt(deptId));
    return dept ? dept.name : "";
  };

  // Get employees not currently in the group
  const getAvailableEmployees = () => {
    return departmentEmployees.filter(emp =>
      emp.id && emp.first_name && emp.last_name &&
      !selectedEmployees.some(selectedEmp => selectedEmp.id === emp.id)
    );
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <FloatingLabel label="Group Name" className="mb-3">
          <Form.Control
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
          />
        </FloatingLabel>

        <Form.Group className="mb-3">
          <Form.Label>Department</Form.Label>
          <Form.Control
            type="text"
            value={getDepartmentName(selectedDepartment)}
            readOnly
            className="bg-light"
          />
        </Form.Group>

        <FloatingLabel label="Description" className="mb-3">
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter group description"
          />
        </FloatingLabel>

        {/* Selected Employees */}
        <Form.Group className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="fw-bold">Group Members</Form.Label>
            <Badge bg="primary" className="rounded-pill">
              {selectedEmployees.length} selected
            </Badge>
          </div>
          
          {selectedEmployees.length > 0 ? (
            <div 
              className="border rounded p-2 mb-3" 
              style={{ maxHeight: "150px", overflowY: "auto" }}
            >
              {selectedEmployees.map((emp) => (
                <div 
                  key={emp.id} 
                  className="py-1 px-2 small d-flex justify-content-between align-items-center"
                >
                  <span>
                    {emp.id} - {emp.first_name} {emp.last_name}
                  </span>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleRemoveEmployee(emp.id)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Alert variant="info" className="small">
              No employees selected for this group.
            </Alert>
          )}
        </Form.Group>

        {/* Available Employees */}
        {selectedDepartment && (
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Available Employees</Form.Label>
            {loadingEmployees ? (
              <div className="text-center py-3">
                <Spinner animation="border" variant="primary" size="sm" />
                <span className="ms-2">Loading employees...</span>
              </div>
            ) : getAvailableEmployees().length > 0 ? (
              <div 
                className="border rounded p-2" 
                style={{ maxHeight: "150px", overflowY: "auto" }}
              >
                {getAvailableEmployees().map((emp) => (
                  <div 
                    key={emp.id} 
                    className="py-1 px-2 small d-flex justify-content-between align-items-center"
                  >
                    <span>
                      {emp.id} - {emp.first_name} {emp.last_name}
                    </span>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleAddEmployee(emp)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Alert variant="info" className="small">
                No additional employees available in this department.
              </Alert>
            )}
          </Form.Group>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" /> Updating...
            </>
          ) : (
            <>
              <CheckCircle className="me-1" /> Update Group
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupEditModal;
