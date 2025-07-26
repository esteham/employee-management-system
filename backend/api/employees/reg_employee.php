<?php
require_once '../config/init.php';

if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'hr'])) {
    echo json_encode([
            'success' => false, 
            'message' => 'Unauthorized Access'
        ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
            'success' => false, 
            'message' => 'Invalid Request'
        ]);
    exit;
}

require_once '../../classes/class_admin.php';
$admin = new Admin();
$pdo = $admin->getPDO();

try {
    // Required Fields
    $first_name     = $_POST['first_name'] ?? '';
    $last_name      = $_POST['last_name'] ?? '';
    $email          = $_POST['email'] ?? '';
    $phone          = $_POST['phone'] ?? '';
    $username       = $_POST['username'] ?? '';
    $department_id  = $_POST['department_id'] ?? '';

    // Optional Emergency Fields
    $address            = $_POST['address'] ?? null;
    $emergency_name     = $_POST['emergency_name'] ?? null;
    $emergency_phone    = $_POST['emergency_phone'] ?? null;
    $emergency_relation = $_POST['emergency_relation'] ?? null;

    // Basic Validation
    if (!$first_name || !$last_name || !$email || !$phone || !$username || !$department_id) {
        echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
        exit;
    }

    // Insert into employees table
    $stmt = $pdo->prepare("INSERT INTO 
            employees (first_name, last_name, email, phone, department_id, address, emergency_name, emergency_phone, emergency_relation, join_date, status)
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'active')
        ");
    $stmt->execute([
        $first_name,
        $last_name,
        $email,
        $phone,
        $department_id,
        $address,
        $emergency_name,
        $emergency_phone,
        $emergency_relation
    ]);

    $employeeID = $pdo->lastInsertId();

    // File Upload (certificate, experience)
    $uploadDir = '../../assets/documents/';
    $docFiles  = ['certificate', 'experience'];

    foreach ($docFiles as $docType) {
        if (isset($_FILES[$docType]) && $_FILES[$docType]['error'] === 0) {
            $filename = time() . '_' . basename($_FILES[$docType]['name']);
            $filepath = $uploadDir . $filename;

            move_uploaded_file($_FILES[$docType]['tmp_name'], $filepath);

            $docInsert = $pdo->prepare("INSERT INTO documents(employee_id, doc_type, file_path) VALUES (?, ?, ?)");
            $docInsert->execute([$employeeID, $docType, $filename]);
        }
    }

    // Generate password and hash
    $rawPassword = bin2hex(random_bytes(4)); // 8-digit random password
    $hashPassword = password_hash($rawPassword, PASSWORD_DEFAULT);

    // Insert into users table
    $userInsert = $pdo->prepare("INSERT INTO users (username, password, role, employee_id, status)
                                 VALUES (?, ?, 'employee', ?, 'active')");
    $userInsert->execute([$username, $hashPassword, $employeeID]);

    // Send email
    $subject = "Your Employee Account is Ready";
    $message = "
        Dear $first_name $last_name,

        Your employee account has been created successfully.

        Username: $username
        Temporary Password: $rawPassword

        Please login and change your password immediately.

        Thank you,
        HR/Admin Team
    ";

    $mailSend = $admin->sendMail($email, $message, $subject);

    if ($mailSend) {
        echo json_encode([
                'success' => true, 
                'message' => 'Employee registered and mail sent successfully'
            ]);
    } else {
        echo json_encode([
            'success' => true, 
            'message' => 'Employee registered but mail not sent'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
            'success' => false, 
            'message' => 'Error: ' . $e->getMessage()
        ]);
}
