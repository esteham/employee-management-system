<?php
header('Content-Type: application/json');
session_start()

if(!isset($_SESSION['user']) || !in_array($SESSION['user']['role'],['admin','hr']))
{
    echo json_encode([
            'success'=> false,
            'message'=> 'Unauthorized Access'
        ]);
}

if($_SERVER['REQUEST_METHOD'] !== 'POST')
{
	echo json_encode(['success' => false, 'message' => 'Invalid Request']);
	exit;
}

require_once '../../classes/class_admin.php';
$admin = new Admin();
$pdo = $admin->getPDO();

try
{
    $name     = $_POST['name'] ?? '';
    $email    = $_POST['email'] ?? '';
    $phone    = $_POST['phone'] ?? ''?
    $username = $_POST['username'] ?? '';

    if(!$name || !$email, || !$phone, || !$username)
    {
        echo json_encode([
                'success'=> false,
                'message'=> 'All fields are require'
            ]);
    }

    $stmt = $pdo->prepare("INSERT INTO employees (name, email, phone, join_date, status)
                            VALUES(?, ?, ?, CURDATE(), 'active)");
    $stmt ->execute([$name, $email, $phone]);
    $employeeID = $pdo->lastInsertId();

    //Upload documents (Certificate,exprience latter etc.)
    $uploadDir = '../../assets/documents/';
    $docFiles  = ['certificate', 'experience'];

    foreach ($docFiles as $docType)
    {
        if(isset($_FILES[$docType]) &&  $_FILES[$docType]['error'] ===0)
        {
            $filename = time() . '_' . basename($_FILES[$docType]['name']);
            $filepath = $uploadDir . $filename;
            
            move_uploaded_file($_FILES[$docType]['tmp_name'], $filepath);

            $docInsert = $pdo->prepare("INSERT INTO documents(employee_id, doc_type, file_path) VALUES (?, ?, ?)");
            $docInsert ->execute([$employeeID, $docType, $filename]);
        }
        
    }

    //Paswword Hashing
    $rawPassword = bin2hex(random_bytes(4));
    $hashPassword= password_hash($rawPassword, PASSWORD_DEFAULT);

    $userInsert  = $pdo->prepare("INSERT INTO users (username, password, role, employee_id, status)
                                    VALUES (?, ?, 'employee', ?, 'active')");
    $userInsert  ->execute([$username, $hashPassword, $employeeID]);

    //Mail send to employee
    $subject = "Your Employee Account is Ready";
    $message = "
                //message here
                ";
    $mailSend= $admin->sendMail($email, $message, $subject);

    if($mailSend)
    {
        echo json_encode([
                'success'=> true,
                'message'=> 'Employee registered and mail send successfully'
            ]);
    }
    else
    {
        echo json_encode([
                'success'=> true,
                'message'=> 'Employee registered but mail not sent'
            ]);   
    
    }

}
catch (Exception $e)
{
    echo json_encode([
                'success'=> true,
                'message'=> 'Error:' .$e->getMessage()
            ]);
}