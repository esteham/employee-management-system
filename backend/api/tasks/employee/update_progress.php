<?php
require_once '../../config/init.php';
require_once '../../../classes/class_admin.php';

$admin = new Admin();
$pdo = $admin->getPDO();

if(!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'employee')
{
	echo json_encode([
            'success' => false, 
            'message' => 'Unauthorized Access'
        ]);
	exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST')
{
	echo json_encode([
            'success' => false, 
            'message' => 'Invalid Request'
        ]);
	exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$employeeID = $_SESSION['user']['employee_id'];
$task_id    = $input['task_id'] ?? null;
$progress   = $input['progress_percent'] ?? null;

if(!$task_id || $progress === null || $progress < 0 || $progress > 100)
{
    echo json_encode([
            'success'=> false, 
            'message'=> 'Invalid INPUT data'
        ]);
    exit;
}

try
{
    $check  = $pdo->prepare("SELECT id FROM task_progress WHERE task_id = ? AND employee_id = ?");
    $check  ->execute([$task_id, $employeeID]);

    if($check->rowCount() > 0)
    {
        $update = $pdo->prepare("UPDATE task_progress SET progress = ?, updated_at = NOW() WHERE task_id = ? AND employee_id = ?");
        $update->execute([$progress, $task_id, $employeeID]);
    }

    else
    {
        $insert = $pdo->prepare("INSERT INTO task_progress (task_id, employee_id, progress, updated_at) VALUES (?, ?, ?, NOW())");
        $insert->execute([$task_id, $employeeID, $progress]);
    }

    echo json_encode([
            'success' => true, 
            'message' => 'Progress updated'
        ]);

}
catch (Exception $e)
{
    echo json_encode([
            'success'=>false, 
            'message'=>'Update Failed',
            'error'=> $e->getMessage()
        ]);
}