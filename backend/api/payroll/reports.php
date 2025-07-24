<?php
require_once '../config/init.php';

if(!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'],['admin','hr']))
{
    echo json_encode(['succes'=> false, 'message'=> "Unauthorized"]);
    exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST')
{
    echo json_encode(['succes'=> false, 'message'=> "Invalid Request"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$month = $data['month'] ?? null;
$year = $data['year'] ?? null;

if(!$month || !$year)
{
    echo json_encode(['succes'=> false, 'message'=> "Month and Year Required"]);
    exit;
}

require_once '../../classes/class_admin.php';
$admin = new Admin();

try {
    $report = $admin->getPayrollReport($month, $year);
    echo json_encode(['success'=> true, 'data'=> $report]);    
} 
catch (Exceptin $e) {
    echo json_encode(['success'=> false, 'message'=> 'Failed to generated reports']);
}