<?php
$host = "localhost";
		$db		= "ems_db";
		$user	= "root";
		$pass	= "";
		$charset= "utf8mb4";

		$dsn = "mysql:host=$host; dbname=$db; charset=$charset";
		$options = [

			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
		];

		try
		{
			$pdo = new PDO($dsn, $user, $pass, $options);
			
		}

		catch(PDOException $e)
		{
			die("DB Connection Failed: ".$e->getMessage());
		}
$first_name		= "Employee";
$last_name		= "Spider"
$email			= "demoemp@email.com";
$phone			= "0123456789";
$username		= "employee1";
$password_raw	= "09876543";
$password_hashed= password_hash($password_raw, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if($stmt->rowCount() > 0)
{
	exit("user already exists");
}

$empInsert = $pdo->prepare("INSERT INTO employees (first_name, last_name, email, phone, join_date, status) VALUES(?,?,?,?,CURDATE(), 'active')");
$empInsert->execute([$first_name, $last_name, $email, $phone]);
$employeeID = $pdo->lastInsertId();

$userInsert = $pdo->prepare("INSERT INTO users(username, password, role, employee_id, status) VALUES(?,?,'employee',?,'active')");
$userInsert->execute([$username, $password_hashed, $employeeID]);

echo "Test employee '$username' created with password '$password_raw'";
?>