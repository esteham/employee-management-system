<?php
// init.php
session_start();

// CORS header set (React frontend এর জন্য)
header('Access-Control-Allow-Origin: http://localhost:5173'); 
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
