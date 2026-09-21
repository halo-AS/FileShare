<?php
header('Content-Type: application/json');

// check if a key exists, and load other variables
$key = $_GET['key'] ?? '';
$file = __DIR__ . '/sessions.json';
$sessions = json_decode(file_get_contents($file), true);

// Check if the does not exist, and return an error if so
if (!isset($sessions[$key]) or !$sessions[$key]['offer']) {
    http_response_code(404);
    echo json_encode(['error' => 'no offer yet']);
    exit;
}

// return the offer for the key
echo json_encode(['sdp' => $sessions[$key]['offer']]);
