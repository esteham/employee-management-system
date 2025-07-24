<?php
require_once '../config/init.php'

if($_SERVER['REQUEST_METHOD'] !== 'GET');
{
    echo json_encode(['success' => false, 'message' => 'Invalid Request']);
    exit;
}

require_once '../../classes/class_admin.php';
$admin = new Admin();

try
{
    $holidays = $admin->getHolidays();
    echo json_encode(['success' => true, 'data' => $holidays]);
}
catch(Exception $e)
{
    echo json_encode(['success' => false, 'message' => 'Failed to get holidya info']);
}