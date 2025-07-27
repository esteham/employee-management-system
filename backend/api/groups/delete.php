<?php
require_once '../config/init.php';

require_once '../../classes/class_admin.php';
$admin = new Admin();

if(!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'],['admin','hr']));
{
    echo json_encode([
            'success'=> false,
            'message'=> 'Unauthorized'
        ]);
    exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST')
{
    echo json_encode([
            'success'=> false, 
            'message'=> 'Invalid Request'
        ]);
    exit;
}

$data    = json_decode(file_get_contents("php://input"), true);
$groupID = $data['group_id'] ?? 0;

if(!$groupID)
{
    echo json_encode([
            'success' => false, 
            'message' => 'Group ID required'
        ]);
	exit;
}

try 
{
	$pdo = $admin->getPDO();

	//Remove group members first
	$pdo->prepare("DELETE FROM group_members WHERE group_id = ?")->execute([$groupID]);

	//Then remove group
	$pdo->prepare("DELETE FROM groups WHERE id = ?")->execute([$groupID]);

	echo json_encode([
            'success' => true, 
            'message' => 'Group deleted successfully'
        ]);
} 
catch (Exception $e) 
{
	echo json_encode([
            'success' => false, 
            'message' => 'Failed to delete group', 
            'error' => $e->getMessage()
        ]);
}