<?php
header('Content-Type: application/json');
session_start();

if($_SERVER['REQUEST_METHOD'] !== 'POST')
{
    echo json_encode(['success'=> false, 'message'=> 'Invalid request method']);
    exit;
}

/*
Mustbe logged in and a valid employee
*/
if(!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'employee')
{
    echo json_encode(['success' => false, 'message' => 'Unauthorised access']);
    exit;
}

require_once '../../classes/class_admin.php';
$admin  = new Admin();

$employeeID = $_SESSION['user']['employee_id'];
$today      = date('Y-m-d');

//Check if alreday marked today
$result = $admin->checkTodayAttendance($employeeID);

if($result['already_marked'])
{
    echo json_encode([
        'success' => false,
        'message' => 'Attendance already marked today',
        'time'    => $result['check_in']
    ]);
    exit;
}

$attendanceResult = $admin->recordAttendance($employeeID);

echo json_encode($attendanceResult);