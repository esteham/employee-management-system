<?php
session_start();

// ✅ CORS Headers
header("Access-Control-Allow-Origin: http://localhost:5173"); //React origin
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type"); // 🔑 Without this, content-type error will occur
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Allow preflight requests

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