<?php
require_once '../config/init.php';
require_once '../../classes/class_admin.php';

// Ensure user is authenticated (optional, but recommended)
if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'hr'])) {
    echo json_encode([
            'success' => false, 
            'message' => 'Unauthorized Access'
        ]);
    exit;
}

// Read raw JSON input
$input = json_decode(file_get_contents("php://input"), true);
$department_id = $input['department_id'] ?? null;

if (!$department_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Department ID is required.'
    ]);
    exit;
}

// Initialize DB connection
$admin = new Admin();
$data = $admin->getEmployeesByDepartment($department_id);

if (!empty($data)) {
    echo json_encode([
        'success'   => true,
        'employees' => $data
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No employees found for this department.'
    ]);
}
?>