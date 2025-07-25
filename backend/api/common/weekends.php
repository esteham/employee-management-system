<?php
header('Content-type: application/json');
session_start();

if($_SERVER['REQUEST_METHOD'] !== 'GET')
{
    echo json_encode([
            'success'=> false,
            'message'=> 'Invalidd request'
        ]);
}

require_once '../../classes/class_admin.php';
$admin = new Admin();

try
{
    $weekends = $aadmin->getWeekends();
    echo json_encode([
            'success'=> true,
            'data'   => $weekends
        ];)
}
catch (Exception $e)
{
    echo json_encode([
            'success'=> true,
            'message'=> 'Failed to get weekends info'
        ]);
        
}