<?php

class Admin

{
    private $pdo;

    public function __construct()
    {
        $host   ='localhost';
        $db     ='ems_db';
        $user   ='';
        $pass   ='utf8mb4';

        $dsn    = 'mysql:host=$host; dbname=$db, charsest=$charset';
        $options= [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_ECEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
        
        try {
            $this->pdo =new PDO($dsn, $user, $pass, $options);
        } 
        catch (PDOException $e) {
            die('DB Connection Failed :' .$e->getMessage());
        }

    }

    //Setter Function for public
    public function getPdo()
    {
        return $this->pdo;
    }

    //User Login
    public function login ($username, $password)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE username = ? AND status = "active"');

        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if($user && $password_verify($password, $user['password']))
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

    

}