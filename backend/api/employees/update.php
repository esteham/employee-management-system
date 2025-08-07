<?php
require_once '../config/init.php';
require_once '../../classes/class_admin.php';

$admin = new Admin();
$pdo = $admin->getPDO();

// POST data
$id = $_POST['id'];
$first_name = $_POST['first_name'];
$last_name = $_POST['last_name'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$address = $_POST['address'];
$emergency_name = $_POST['emergency_name'];
$emergency_phone = $_POST['emergency_phone'];
$emergency_relation = $_POST['emergency_relation'];
$department_id = $_POST['department_id'];

try {
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $uploadDir = '../../assets/uploads/employee/';

        if (!is_dir($uploadDir)){
            mkdir($uploadDir, 0755, true);
        }

        $stmt = $pdo->prepare("SELECT image FROM employees WHERE id = ?");
        $stmt->execute([$id]);
        $existingImage = $stmt->fetchColumn();

        if ($existingImage) {
            $oldImagePath = '../../assets/uploads/employee/' . $existingImage;
            if (file_exists($oldImagePath)) {
                unlink($oldImagePath);
            }
        }

        $imageName = time() . '_' . basename($_FILES['image']['name']);
        $imagePath = '../../assets/uploads/employee/' . $imageName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $imagePath)) {
            $stmt = $pdo->prepare("UPDATE employees SET image = ? WHERE id = ?");
            $stmt->execute([$imageName, $id]);
        } else {
            throw new Exception('Image upload failed.');
        }
    }

    $stmt = $pdo->prepare("UPDATE employees 
        SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, 
            emergency_name = ?, emergency_phone = ?, emergency_relation = ?, department_id = ? 
        WHERE id = ?");
    $stmt->execute([
        $first_name,
        $last_name,
        $email,
        $phone,
        $address,
        $emergency_name,
        $emergency_phone,
        $emergency_relation,
        $department_id,
        $id
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Employee updated successfully.'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Update failed: ' . $e->getMessage()
    ]);
}
