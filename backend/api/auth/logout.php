<?php
session_start();
header('Content-Type: application/json');

$_SESSION = [];

if(ini_get('session.use_cookies'))
{
    $params = session_get_cookie_params();

    setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly'] 
            );
}

session_destroy();

//Response
echo json_encode([
    'success' => true,
    'message' => 'Logout Successfull'
]);