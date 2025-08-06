import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
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
      setStep(1);
    }
  }, [employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("id", employee.id);

    if (selectedImage) {
      formData.set("image", selectedImage);
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
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h4">Edit Employee</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-1">
        <Form onSubmit={handleSubmit}>
          {/* -------- Step 1: Basic Info -------- */}
          {step === 1 && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      name="first_name"
                      defaultValue={employee.first_name}
                      className="rounded-0"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      name="last_name"
                      defaultValue={employee.last_name}
                      className="rounded-0"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      name="email"
                      type="email"
                      defaultValue={employee.email}
                      className="rounded-0"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      name="phone"
                      defaultValue={employee.phone}
                      className="rounded-0"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  name="address"
                  as="textarea"
                  rows={2}
                  defaultValue={employee.address}
                  className="rounded-0"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  name="department_id"
                  defaultValue={employee.department_id}
                  className="rounded-0"
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
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Emergency Contact Name</Form.Label>
                    <Form.Control
                      name="emergency_name"
                      defaultValue={employee.emergency_name}
                      className="rounded-0"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Emergency Contact Phone</Form.Label>
                    <Form.Control
                      name="emergency_phone"
                      defaultValue={employee.emergency_phone}
                      className="rounded-0"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Emergency Contact Relation</Form.Label>
                <Form.Control
                  name="emergency_relation"
                  defaultValue={employee.emergency_relation}
                  className="rounded-0"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Profile Image</Form.Label>
                <div className="d-flex align-items-center mb-3">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="img-thumbnail me-3"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  ) : employee.image ? (
                    <img
                      src={`${BASE_URL}backend/assets/uploads/employee/${employee.image}`}
                      alt="Current"
                      className="img-thumbnail me-3"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="bg-light d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "100px",
                        height: "100px",
                      }}
                    >
                      <span className="text-muted">No image</span>
                    </div>
                  )}
                  <div>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      name="image"
                      className="rounded-0"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setSelectedImage(file);
                        setPreviewImage(URL.createObjectURL(file));
                      }}
                    />
                    <Form.Text className="text-muted">
                      JPG, PNG up to 2MB
                    </Form.Text>
                  </div>
                </div>
              </Form.Group>
            </>
          )}

          {/* -------- Navigation Buttons -------- */}
          <div className="d-flex justify-content-between pt-3 border-top">
            {step > 1 ? (
              <Button
                variant="outline-secondary"
                onClick={() => setStep(step - 1)}
                className="px-4 rounded-0"
              >
                Previous
              </Button>
            ) : (
              <div></div>
            )}

            {step < 2 ? (
              <Button
                variant="primary"
                onClick={() => setStep(step + 1)}
                className="px-4 rounded-0"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="success"
                className="px-4 rounded-0"
              >
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
