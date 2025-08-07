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

  const [formValues, setFormValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    emergency_name: "",
    emergency_phone: "",
    emergency_relation: "",
    department_id: "",
  });

  useEffect(() => {
    if (employee) {
      setFormValues({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        address: employee.address || "",
        emergency_name: employee.emergency_name || "",
        emergency_phone: employee.emergency_phone || "",
        emergency_relation: employee.emergency_relation || "",
        department_id: employee.department_id || "",
      });
      setSelectedImage(null);
      setPreviewImage(null);
      setStep(1);
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("id", employee.id);
    formData.append("first_name", formValues.first_name);
    formData.append("last_name", formValues.last_name);
    formData.append("email", formValues.email);
    formData.append("phone", formValues.phone);
    formData.append("address", formValues.address);
    formData.append("emergency_name", formValues.emergency_name);
    formData.append("emergency_phone", formValues.emergency_phone);
    formData.append("emergency_relation", formValues.emergency_relation);
    formData.append("department_id", formValues.department_id);

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
                  value={formValues.first_name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  name="last_name"
                  value={formValues.last_name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  name="phone"
                  value={formValues.phone}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  name="address"
                  as="textarea"
                  rows={2}
                  value={formValues.address}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  name="department_id"
                  value={formValues.department_id}
                  onChange={handleChange}
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
                  value={formValues.emergency_name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Emergency Contact Phone</Form.Label>
                <Form.Control
                  name="emergency_phone"
                  value={formValues.emergency_phone}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Emergency Contact Relation</Form.Label>
                <Form.Control
                  name="emergency_relation"
                  value={formValues.emergency_relation}
                  onChange={handleChange}
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
