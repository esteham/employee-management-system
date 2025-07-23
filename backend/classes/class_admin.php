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

        $dsn    = "mysql:host=$host; dbname=$db; charsest=$charset";
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
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE username = ? AND status = "active"');

        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if($user && password_verify($password, $user['password']))
        {
            //Success
            return [
                'success'   =>true,
                'data'      =>[
                            'id'            =>$user['id'],
                            'employee_id'   =>$user['employee_id'],
                            'role'          =>$user['role']
                ],
            ];
        }

        else{
            return ['success'=> false, 'massage'=>'Invalid login credentials'];
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

        /check iif already marked today
        $check = $this->pdo->prepare("SELECT id FROm attendance WHERE employee_id = ? AND date = ?");
        $check->execute([$employeeID, $today]);

        if($check->rowCount() > 0)
        {
            return ['success'=> false, 'massage'=> 'Already marked today']
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
        $rule   = $this->pdo->prepare("SELECT * FROM login_rules WHERE employee_id = ?");
        $rule   ->execute([$employeeID]);
        $loginRule = $rule->fetch();

        //Late Count and fine 
        $isLate = 0;
        $fine   = 0;

        if($loginRule)
        {
            $officialTime   = strtotime($loginRule['login_time']);
            $graceTime      = $loginRule['grace_period_minutes'] * 60;
            $currentTime    = strtotime($timeNow);

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
            $fineLog        = $this->pdo->prepare("INSERT INTO late_fines (employee_id, attendance_id, date, fine_amount) VALUES (?, ?, ?, ?)");
            $fineLog        ->execute([$employeeID, $attendanceID, $today, $fine]);
        }

        return ['success'=> true, 'message' => 'Attendance Recorded', 'late' => $isLate, 'fine' => $fine];

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
                'already_marked'    => true,
                'check_in'          => $row['check_in'],
            ];

        }

        return [
            'already_marked' => false
        ];

    }
    /* ================
    End Check if alreday marked today
    =====================*/

}