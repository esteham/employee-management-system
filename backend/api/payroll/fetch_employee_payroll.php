<?php
require_once '../config/init.php';

//Allow only HR/Admin
if(!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'hr'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid Request']);
    exit;
}

require_once '../../classes/class_admin.php';
$admin = new Admin();

$data = json_decode(file_get_contents("php://input"), true);
$employeeID = $data['employee_id'] ?? null;
$month = $data['month'] ?? null;
$year = $data['year'] ?? null;

if(!$employeeID || !$month || !$year) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Fetch basic salary & existing payroll if any
$result = $admin->fetchPayrollData($employeeID, $month, $year);
echo json_encode($result);
