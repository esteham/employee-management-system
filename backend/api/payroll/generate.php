<?php
session_start();
header('Content-Type:  application/json');

//Allow only HR/Admin
if(!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'],['admin']['hr']))
{
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST')
{
    echo json_encode(['success' => false, 'message' => 'Invalid Request']);
	exit;
}

require_once '../../classes/class_admin.php';
$admin = new Admin();

$data       = json_decode(file_get_contents("php://input"), true);
$employee   = $data['employee_id'] ?? null;
$month      = $data['month'] ?? null;
$year       = $data['year'] ?? null;
$bonus      = $data['bonus'] ?? 0;
$deduction  = $data['deduction'] ?? 0;
$overTime   = $data['overtime'] ?? 0;

if(!$employeeID || !$month || !$year)
{
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$existing = $admin->payrollExists($employeeID, $month, $year);

if($existing)
{
    echo json_encode(['success' => false, 'message' => 'Payroll already generated']);
    exit;
}

$result = $admin->generatePayroll($employeeID, $month, $year, $bonus, $deduction, $overTime);
echo json_encode($result);
