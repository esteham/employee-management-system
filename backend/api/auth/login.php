<?php
session_start();
header('Content-Type: application/json');

if($_SERVER['REQUEST_METHOD'] !== 'POST')
{
    echo json_encode(['success'=> false, 'massage'=>'Invalid request methods']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if(empty($username) || empty($password))
{
    echo json_encode(['success'=> false, 'message'=> 'Username and Password required']);
    exit;
}

require_once '../../classes/class_admin.php';

$admin = new Admin();

$result = $admin->login($username, $password);

if($result['success'])
{
    $_SESSION['user'] =[
        'id'    => $result['data']['id'],
        'employee_id' => $result['data']['employee_id'],
        'role'  => $result['data']['role']
    ];

    echo json_encode(['success'=> true, 'message'=> 'Login Successfull','role'=> $result['data']['role']]);
}

else
{
    echo json_encode(['success'=>  false, 'message'=> $result['message']]);
}