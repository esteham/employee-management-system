<?php
require_once '../config/init.php';

if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'hr'])) {
    echo json_encode([
        'success' => false,
        'message' => "Unauthorized"
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => "Invalid Request"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;

if (!$id) {
    echo json_encode([
        'success' => false,
        'message' => "ID is required"
    ]);
    exit;
}

require_once '../../classes/class_admin.php';
$admin = new Admin();

try {
    // প্রথমে ঐ id এর month, year বের করলাম
    $monthYear = $admin->getMonthYearById($id);
    
    if (!$monthYear) {
        echo json_encode([
            'success' => false,
            'message' => "No payroll record found for the given ID"
        ]);
        exit;
    }

    // ঐ month ও year দিয়ে রিপোর্ট নিয়ে আসলাম
    $report = $admin->getPayrollReportByMonthYear($monthYear['month'], $monthYear['year']);

    echo json_encode([
        'success' => true,
        'data' => $report
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate report'
    ]);
}
