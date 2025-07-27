import React, { useState } from "react";
import { Button, Row, Col, Card, Form } from "react-bootstrap";
import { PlusCircleFill, PencilSquare, TrashFill } from "react-bootstrap-icons";

const GroupsContent = ({
  groups,
  loadingGroups,
  setShowGroupModal,
  setSelectedGroup,
  setEditModalShow,
  handleDeleteGroup,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroups = groups.filter((group) =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Group Management</h2>
        <Button
          variant="success"
          onClick={() => setShowGroupModal(true)}
          className="d-flex align-items-center"
        >
          <PlusCircleFill className="me-2" /> Create Group
        </Button>
      </div>

      <Form.Control
        type="text"
        placeholder="Search group by name..."
        className="mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loadingGroups ? (
        <p>Loading groups...</p>
      ) : (
        <Row>
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <Col md={6} key={group.group_id} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{group.group_name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Created by: {group.created_by} ({group.created_role})<br />
                      On: {new Date(group.created_at).toLocaleDateString()}
                    </Card.Subtitle>
                    <Card.Text>{group.description}</Card.Text>
                    <strong>Members:</strong>
                    <ul>
                      {group.members.map((member) => (
                        <li key={member.id}>
                          {member.first_name} ({member.email})
                        </li>
                      ))}
                    </ul>
                    <div className="d-flex gap-2 mt-3">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setSelectedGroup(group);
                          setEditModalShow(true);
                        }}
                      >
                        <PencilSquare className="me-2" /> Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteGroup(group.group_id)}
                      >
                        <TrashFill className="me-2" /> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p>No groups found.</p>
          )}
        </Row>
      )}
    </div>
  );
};

export default GroupsContent;