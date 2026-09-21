<?php
header('Content-Type: application/json');

// check if a key exists, and load other variables
$key = $_GET['key'] ?? '';
$file = __DIR__ . '/sessions.json';
$sessions = json_decode(file_get_contents($file), true);

// Check if the does not exist, and return an error if so
if (!isset($sessions[$key]) or !$sessions[$key]['answer']) {
    http_response_code(404);
    echo json_encode(['error' => 'no answer yet']);
    exit;
}

// unset removes the variable for the key inside the sessions array, so it doesnt get clogged up with old sessions
//unset($sessions[$key]);
//file_put_contents($file, json_encode($sessions));

// return the offer for the key
echo json_encode(['sdp' => $sessions[$key]['answer']]);
