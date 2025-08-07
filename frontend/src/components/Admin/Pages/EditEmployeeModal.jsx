import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import axios from "axios";

const EditEmployeeModal = ({
  show,
  onHide,
  employee,
  departments,
  fetchEmployees,
  BASE_URL,
}) => {
  const [step, setStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (employee) {
      setPreviewImage(null);
      setSelectedImage(null);
      setStep(1); // reset to step 1 on new employee
    }
  }, [employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("id", employee.id);
    formData.append("first_name", e.target.first_name.value);
    formData.append("last_name", e.target.last_name.value);
    formData.append("email", e.target.email.value);
    formData.append("phone", e.target.phone.value);
    formData.append("address", e.target.address.value);
    formData.append("emergency_name", e.target.emergency_name.value);
    formData.append("emergency_phone", e.target.emergency_phone.value);
    formData.append("emergency_relation", e.target.emergency_relation.value);
    formData.append("department_id", e.target.department_id.value);

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    axios
      .post(`${BASE_URL}backend/api/employees/update.php`, formData, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          fetchEmployees();
          onHide();
        } else {
          alert(res.data.message);
        }
      })
      .catch((err) => {
        console.error("Update failed", err);
      });
  };

  if (!employee) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Employee</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* -------- Step 1: Basic Info -------- */}
          {step === 1 && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  name="first_name"
                  defaultValue={employee.first_name}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  name="last_name"
                  defaultValue={employee.last_name}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  defaultValue={employee.email}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  name="phone"
                  defaultValue={employee.phone}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  name="address"
                  as="textarea"
                  rows={2}
                  defaultValue={employee.address}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  name="department_id"
                  defaultValue={employee.department_id}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}

          {/* -------- Step 2: Emergency & Image -------- */}
          {step === 2 && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Emergency Contact Name</Form.Label>
                <Form.Control
                  name="emergency_name"
                  defaultValue={employee.emergency_name}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Emergency Contact Phone</Form.Label>
                <Form.Control
                  name="emergency_phone"
                  defaultValue={employee.emergency_phone}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Emergency Contact Relation</Form.Label>
                <Form.Control
                  name="emergency_relation"
                  defaultValue={employee.emergency_relation}
                />
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
                ) : employee.image ? (
                  <img
                    src={`${BASE_URL}backend/assets/uploads/employee/${employee.image}`}
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
            </>
          )}

          {/* -------- Navigation Buttons -------- */}
          <div className="d-flex justify-content-between">
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                Previous
              </Button>
            )}
            {step < 2 && (
              <Button variant="primary" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            )}
            {step === 2 && (
              <Button type="submit" variant="success">
                Save Changes
              </Button>
            )}
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditEmployeeModal;