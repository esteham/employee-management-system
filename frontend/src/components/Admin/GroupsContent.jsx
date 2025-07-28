import React, { useState } from "react";
import { Button, Row, Col, Card, Form } from "react-bootstrap";
import {
  PlusCircleFill,
  PencilSquare,
  TrashFill,
  EyeFill,
} from "react-bootstrap-icons";
import * as XLSX from "xlsx";

const GroupsContent = ({
  groups,
  loadingGroups,
  setShowGroupModal,
  setSelectedGroup,
  setEditModalShow,
  handleDeleteGroup,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroupId, setExpandedGroupId] = useState(null);

  const filteredGroups = groups.filter((group) =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Excel Download Function
  const handleDownloadExcel = (group) => {
    const rows = [
      ["Employee List"], 
      [`Group: ${group.group_name}`], 
      [], 
      ["ID", "Name", "Email"], 
      ...group.members.map((member) => [
        member.id,
        member.first_name,
        member.email,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Employee list of group ${group.group_name}`
    );
    XLSX.writeFile(workbook, `Employee_List_${group.group_name}.xlsx`);
  };

  return (
    <div translate="no">
      {/* Header */}
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

      {/* Search Field */}
      <Form.Control
        type="text"
        placeholder="Search group by name..."
        className="mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Group List */}
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

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 mt-3 flex-wrap">
                      {/* Toggle Details */}
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() =>
                          setExpandedGroupId(
                            expandedGroupId === group.group_id ? null : group.group_id
                          )
                        }
                      >
                        <EyeFill className="me-2" />
                        {expandedGroupId === group.group_id ? "Hide Details" : "Details"}
                      </Button>

                      {/* Edit */}
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

                      {/* Delete */}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteGroup(group.group_id)}
                      >
                        <TrashFill className="me-2" /> Delete
                      </Button>

                      {/* XLSX Download */}
                      {expandedGroupId === group.group_id && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleDownloadExcel(group)}
                        >
                          📥 Download XLSX
                        </Button>
                      )}
                    </div>

                    {/* Expanded Member List */}
                    {expandedGroupId === group.group_id && (
                      <div className="mt-3">
                        <strong>Members:</strong>
                        <ul>
                          {group.members.map((member) => (
                            <li key={member.id}>
                              {member.first_name} ({member.email})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
