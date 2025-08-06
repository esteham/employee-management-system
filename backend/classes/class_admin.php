<?php
class Admin

{
    private $pdo;

    public function __construct()
    {
        $host   ='localhost';
        $db     ='ems_db';
        $user   ='root';
        $pass   ='';
        $charset='utf8mb4';

        $dsn    = "mysql:host=$host; dbname=$db; charset=$charset";
        $options= [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
        
        try {
            $this->pdo =new PDO($dsn, $user, $pass, $options);
        } 
        catch (PDOException $e) {
            die('DB Connection Failed :' .$e->getMessage());
        }

    }

    /*
    Setter Function for public
   */
    public function getPDO()
    {
        return $this->pdo;
    }

    /* ================
    User Login
    =====================*/
    public function login ($username, $password)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ? AND status = 'active'");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if($user && password_verify($password, $user['password']))
        {
            //Success
            return [
                'success'   =>true,
                'data'      =>[
                            'id'         =>$user['id'],
                            'employee_id'=>$user['employee_id'],
                            'role'       =>$user['role']
                ],
            ];
        }

        else{
            return [
                'success'=> false, 
                'message'=>'Invalid login credentials'
            ];
        }
    }
    /* =============
    End User Login
    ==============*/

    /* ===============
    Send mail function
    ================*/
    public function sendMail($email, $message, $subject, $attachment = [])
	{
		require_once __DIR__ . '/../admin/PHPMailer//PHPMailer.php';
		require_once __DIR__ . '/../admin/PHPMailer/SMTP.php';

		$mail = new PHPMailer\PHPMailer\PHPMailer();
		$mail->isSMTP();
		$mail->SMTPDebug = 0; // use 2 for debug
		$mail->Host = 'smtp.gmail.com';
		$mail->SMTPAuth = true;
        
		$mail->Username = 'deepseekspider@gmail.com';
		$mail->Password = 'rjvaiybizhrajodd'; // App password
		$mail->SMTPSecure = 'tls';
		$mail->Port = 587;

		$mail->setFrom('deepseekspider@gmail.com', 'Xetlab');
		$mail->addAddress($email);

        //attachment
        foreach ($attachment as $files)
        {
            if(file_exists($files))
            {
                $mail->addAttachment($files);
            }
        }
		$mail->isHTML(true);
		$mail->CharSet = 'UTF-8';
		$mail->AltBody = strip_tags($message);
		$mail->Subject = $subject;
		$mail->Body = $message;

		if (!$mail->send()) {
			$_SESSION['mailError'] = $mail->ErrorInfo;
			return false;
		} else {
			return true;
		}
	}
    /* =================
    End Send mail function
    ====================*/

    /*=============
    GetAllEmployees
    ==============*/
    public function getAllEmployees() 
    {
        $sql = "SELECT e.*, d.name AS department_name, u.role AS user_role
                FROM employees e
                LEFT JOIN departments d ON e.department_id = d.id
                LEFT JOIN users u ON e.id = u.employee_id
                ORDER BY e.id DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // deleteEmployeeById
    public function deleteEmployeeById($id) 
    {
        $sql = "DELETE FROM employees WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$id]);
    }

    /*================
    End getAllEmployees
    =================*/


    /* ================
    Record Attendance
    =====================*/
    public function recordAttendance($employeeID)
    {
        $today  = date('Y-m-d');
        $timeNow= date('H:i:s');

        //check iif already marked today
        $check = $this->pdo->prepare("SELECT id FROm attendance WHERE employee_id = ? AND date = ?");
        $check->execute([$employeeID, $today]);

        if($check->rowCount() > 0)
        {
            return [
                'success'=> false, 
                'massage'=> 'Already marked today'
            ];
        }

        //check if today is weekend and holiday
        $day    = date('l');
        $holidayChk = $this->pdo->prepare("SELECT id FROM holidays WHERE holiday_date = ?");
        $holidayChk ->execute([$today]);
        $isHoliday  = $holidayChk->rowCount() > 0 ? 1 : 0;

        $weekendChk = $this->pdo->prepare("SELECT id FROM weekends WHERE day_of_week = ?");
        $weekendChk ->execute([$day]);
        $isWeekend  = $weekendChk->rowCount() > 0 ? 1 : 0;

        //Get login rules
        $rule       = $this->pdo->prepare("SELECT * FROM login_rules WHERE employee_id = ?");
        $rule       ->execute([$employeeID]);
        $loginRule  = $rule->fetch();

        //Late Count and fine 
        $isLate = 0;
        $fine   = 0;

        if($loginRule)
        {
            $officialTime= strtotime($loginRule['login_time']);
            $graceTime   = $loginRule['grace_period_minutes'] * 60;
            $currentTime = strtotime($timeNow);

            if($currentTime > ($officialTime + $graceTime) && !$isWeekend && !$isHoliday)
            {
                $isLate = 1;
                $fine   = $loginRule['fine_per_day'];
            }

        }

        //Insert Attendance
        $insert = $this->pdo->prepare("INSERT INTO attendance (employee_id, date, check_in, is_late, is_weekend, is_holiday, late_fine) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $insert ->execute([$employeeID, $today, $timeNow, $isLate, $isWeekend, $isHoliday, $fine]);

        //Login late fine if needed
        if($isLate && $fine > 0)
        {
            $attendanceID  = $this->pdo->lastInsertId();
            $fineLog       = $this->pdo->prepare("INSERT INTO late_fines (employee_id, attendance_id, date, fine_amount) VALUES (?, ?, ?, ?)");
            $fineLog       ->execute([$employeeID, $attendanceID, $today, $fine]);
        }

        return [
            'success'=> true, 
            'message'=> 'Attendance Recorded', 
            'late'   => $isLate, 
            'fine'   => $fine];

    }
    /* ================
    End Record Attendance
    =====================*/

    /* ================
    Check if alreday marked today
    =====================*/
    public function checkTodayAttendance($employeeID)
    {
        $today  = date('Y-m-d');
        $stmt   = $this->pdo->prepare("SELECT check_in FROM attendance WHERE employee_id = ? AND date = ?");
        $stmt   ->execute([$employeeID, $today]);

        if($stmt->rowCount() > 0 )
        {
            $row = $stmt->fetch();
            return [
                'already_marked'=> true,
                'check_in'      => $row['check_in'],
            ];

        }

        return [
            'already_marked' => false
        ];

    }
    /* ================
    End Check if alreday marked today
    =====================*/

    /* ================
    Generate PayrollExists
    =====================*/
    public function payrollExists($employeeID, $month, $year)
	{
		$stmt = $this->pdo->prepare("SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?");

		$stmt ->execute([$employeeID, $month, $year]);

		return $stmt->rowCount() > 0;
	}

    public function fetchPayrollData($employeeID, $month, $year)
    {
        // Get basic salary and overtime rate
        $stmt = $this->pdo->prepare("SELECT basic_salary, overtime_rate FROM salary_structure WHERE employee_id = ?");
        $stmt->execute([$employeeID]);
        $salaryData = $stmt->fetch();

        if(!$salaryData) {
            return ['success' => false, 'message' => 'Salary structure not found'];
        }

        $basicSalary = $salaryData['basic_salary'];
        $overtimeRate = $salaryData['overtime_rate'];

        // Check if payroll already exists for this month and year
        $payrollStmt = $this->pdo->prepare("SELECT * FROM payroll WHERE employee_id = ? AND month = ? AND year = ? LIMIT 1");
        $payrollStmt->execute([$employeeID, $month, $year]);
        $payroll = $payrollStmt->fetch();

        // If payroll exists, load values, else default zero for bonus, deduction, overtime
        $bonus = $payroll['bonus'] ?? 0;
        $deduction = $payroll['deduction'] ?? 0;
        $overtime = $payroll ? $payroll['overtime'] / $overtimeRate : 0;  // convert overtime pay to hours (assuming overtime stored as pay)

        // Get employee name
        $empStmt = $this->pdo->prepare("SELECT first_name FROM employees WHERE id = ?");
        $empStmt->execute([$employeeID]);
        $employee = $empStmt->fetch();
        $employeeName = $employee ? $employee['first_name'] : 'Unknown';

        // Calculate net salary (basic + bonus + overtime pay - deduction)
        $overtimePay = $overtime * $overtimeRate;
        $netSalary = $basicSalary + $bonus + $overtimePay - $deduction;

        return [
            'success' => true,
            'employee_name' => $employeeName,
            'details' => [
                'basic_salary' => $basicSalary,
                'bonus' => $bonus,
                'deduction' => $deduction,
                'overtime' => $overtime,
            ],
            'net_salary' => $netSalary
        ];
    }


	public function generatePayroll($employeeID, $month, $year, $bonus = 0, $deduction = 0, $overTimeHours = 0)
    {
        // Get basic salary and overtime rate
        $stmt = $this->pdo->prepare("SELECT basic_salary, overtime_rate FROM salary_structure WHERE employee_id = ?");
        $stmt->execute([$employeeID]);
        $salaryData = $stmt->fetch();

        if(!$salaryData) {
            return [
                'success' => false, 
                'message' => 'Salary structure not found'
            ];
        }

        $basicSalary = $salaryData['basic_salary'];
        $overtimeRate = $salaryData['overtime_rate'];

        // Set date range
        $start = "$year-$month-01";
        $end = date("Y-m-t", strtotime($start));

        // Get attendance count
        $attStmt = $this->pdo->prepare("SELECT COUNT(*) as total_present FROM attendance WHERE employee_id = ? AND date BETWEEN ? AND ? AND is_weekend = 0 AND is_holiday = 0");
        $attStmt->execute([$employeeID, $start, $end]);
        $totalPresent = $attStmt->fetch()['total_present'];

        // Get total late fine
        $fineStmt = $this->pdo->prepare("SELECT SUM(fine_amount) as total_fine FROM late_fines WHERE employee_id = ? AND date BETWEEN ? AND ?");
        $fineStmt->execute([$employeeID, $start, $end]);
        $totalFine = $fineStmt->fetch()['total_fine'] ?? 0;

        // Calculate overtime payment
        $overtimePay = $overTimeHours * $overtimeRate;

        // Calculate net salary
        $netSalary = $basicSalary + $bonus + $overtimePay - $deduction - $totalFine;

        // Get employee name
        $empStmt = $this->pdo->prepare("SELECT first_name FROM employees WHERE id = ?");
        $empStmt->execute([$employeeID]);
        $employee = $empStmt->fetch();
        $employeeName = $employee ? $employee['first_name'] : 'Unknown';

        // Insert into database
        $insert = $this->pdo->prepare("INSERT INTO payroll (employee_id, month, year, basic_salary, bonus, overtime, deduction, late_fine, net_salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $insert->execute([$employeeID, $month, $year, $basicSalary, $bonus, $overtimePay, $deduction, $totalFine, $netSalary]);

        return [
            'success'       => true,
            'message'       => 'Payroll generated successfully',
            'employee_id'   => $employeeID,
            'employee_name' => $employeeName,
            'net_salary'    => $netSalary,
            'details'       => [
                'present_day' => $totalPresent,
                'overtime'    => $overTimeHours,
                'late_fine'   => $totalFine,
                'bonus'       => $bonus,
                'deduction'   => $deduction
            ]
        ];
    }

    /* ================
    End Generate PayrollExists
    =====================*/

    /* ================
    Generate Payroll Reports
    =====================*/
    public function getMonthYearById($id)
    {
        $sql = "SELECT month, year FROM payroll WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getPayrollReportByMonthYear($month, $year)
    {
        $sql = "SELECT
                    p.id,
                    e.first_name AS employee_name,
                    e.email,
                    p.month,
                    p.year,
                    p.basic_salary,
                    p.bonus,
                    p.overtime,
                    p.deduction,
                    p.late_fine,
                    p.net_salary,
                    p.generated_at
                FROM payroll p
                JOIN employees e ON p.employee_id = e.id
                WHERE p.month = ? AND p.year = ?
                ORDER BY e.first_name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$month, $year]);
        return $stmt->fetchAll();
    }

    /* ================
    End Generate Payroll Reports
    =====================*/

     /* =====================
    Holiday and Weekend Select
    ========================*/
    public function getHolidays()
    {
        $stmt = $this->pdo->query("SELECT id, title, holiday_date FROM holidays ORDER BY holiday_date ASC");
        return $stmt->fetchAll();
    }

    public function getWeekends()
    {
        $stmt = $this->pdo->query("SELECT day_of_week FROM weekens ORDER BY ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    /* =======================
    End Holiday and Weekend Select
    ===========================*/

    /* =================
    Group create function
    ====================*/
    public function createGroup($group_name, $description, $created_by){
        $stmt = $this->pdo->prepare("INSERT INTO groups (group_name, description, created_by) VALUES (?, ?, ?)");
        $stmt ->execute([$group_name, $description, $created_by]);
        return $this->pdo->lastInsertId();
    }

    public function addEmployeesToGroup($group_id, $employee_ids = []){
        $stmt = $this->pdo->prepare("INSERT INTO group_members (group_id, employee_id) VALUES (?, ?)");

        foreach ($employee_ids as $emp_id)
        {
            $stmt ->execute([$group_id, $emp_id]);
        }
        return true;
    }

    public function getAllGroups() {
        $sql = "SELECT id, group_name FROM groups ORDER BY group_name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEmployeesByGroupId($group_id) {
        $sql = "SELECT e.id, e.first_name, e.last_name, e.email
                FROM group_members gm
                JOIN employees e ON gm.employee_id = e.id
                WHERE gm.group_id = ?";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$group_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* =====================
    End Group function
    ========================*/

    /* =====================
    Department function
    ========================*/
    public function getAllDepartments() {
        $sql = "SELECT id, name FROM departments ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDepartmentById($id) 
    {
        $sql = "SELECT id, name FROM departments WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createDepartment($name) 
    {
        $sql = "INSERT INTO departments (name) VALUES (?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$name]);
    }

    public function updateDepartment($id, $name) 
    {
        $sql = "UPDATE departments SET name = ? WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$name, $id]);
    }

    public function deleteDepartment($id) 
    {
        $sql = "DELETE FROM departments WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$id]);
    }

    public function getEmployeesByDepartment($department_id)
    {
        $sql = "SELECT e.id, e.first_name, e.last_name, e.email, e.phone, d.name AS department_name
                FROM employees e
                LEFT JOIN departments d ON e.department_id = d.id
                WHERE e.department_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$department_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* =====================
    End Department function
    ========================*/


}