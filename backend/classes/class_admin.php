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
    public function getPdo()
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
    /* ================
    End User Login
    =====================*/

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

	public function generatePayroll($employeeID, $month, $year, $bonus = 0, $deduction = 0, $overTimeHours = 0)
	{
		$stmt = $this->pdo->prepare("SELECT basic_salary, overtime_rate FROM salary_structure WHERE employee_id = ?");
		$stmt->execute([$employeeID]);
		$salaryData = $stmt->fetch();

		if(!$salaryData)
		{
			return [
                'success' => false, 
                'message' => 'Salary structure not found'
            ];
		}

		$basicSalary = $salaryData['basic_salary'];
		$overtimeRate = $salaryData['overtime_rate'];

		//Count working days and late fines

		$start = "$year-$month-01";
		$end = date("Y-m-t", strtotime($start));

		$attStmt = $this->pdo->prepare("SELECT COUNT(*) as total_present FROM attendance WHERE employee_id = ? AND date BETWEEN ? AND ? AND is_weekend = 0 AND is_holiday = 0");
		$attStmt->execute([$employeeID, $start, $end]);
		$totalPresent = $attStmt->fetch()['total_present'];

        //Sum of late fine in the month
        $fineStmt = $this->pdo->prepare("SELECT SUM(fine_amount) as total_fine FROM late_fines WHERE employee_id = ? AND date BETWEEN ? AND ?");
        $fineStmt ->execute([$employeeID, $start, $end]);

        $totalFine = $fineStmt->fetch()['total_fine'] ?? 0;

        //Overtime payment
        $overtimePay = $overTimeHours * $overtimeRate;

        //Final Net salary
        $netSalary = $basicSalary + $bonus + $overtimePay - $deduction - $totalFine;
        /*add more options like medical,house rent, and some others facilities*/

        //Insert into payroll
        $insert = $this->pdo-> prepare("INSERT INTO payroll (employee_id, month, year, basic_salary, bonus, overtime, deduction, late_fine, net_salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $insert->execute([$employeeID, $month, $year, $basicSalary, $bonus, $overtimePay, $deduction, $totalFine, $netSalary]);

        return [

                'success'   => true,
                'message'   => 'Payroll generated successfully',
                'net_salary'=> $netSalary,
                'details'   => [
                        'predent_day'   => $totalPresent,
                        'overtime'      => $overTimeHours,
                        'late_fine'     => $totalFine,
                        'bonus'         => $bonus,
                        'deduction'     => $deduction
                    ],

            ];

	}
    /* ================
    End Generate PayrollExists
    =====================*/

    /* ================
    Generate Payroll Reports
    =====================*/
    public function getPayrollReport($month, $year)
    {
        $sql = "SELECT
                    p.id,
                    e.name AS employee_name,
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

                    FROM payroll p JOIN employees e ON p.employee_id = e.id WHERE p.month = ? AND p.year = ?
                    ORDER BY e.name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$month, $year]);

        return $stmt->fetchAll();
    }

    /* ================
    End Generate Payroll Reports
    =====================*/


}