<?php
header('Content-Type: application/json');

// load variables
$key = $_GET['key'] ?? '';
$file = __DIR__ . '/sessions.json';
$sessions = json_decode(file_get_contents($file), true);

if (!isset($sessions[$key])) {
    http_response_code(404);
    echo json_encode(['error' => 'invalid key']);
    exit;
}

$body = file_get_contents('php://input');
$data = json_decode($body, true);
$answer = $data['sdp'] ?? null;

if (!$answer) {
    http_response_code(400);
    echo json_encode(['error' => 'missing sdp']);
    exit;
}

$sessions[$key]['answer'] = $answer;
file_put_contents($file, json_encode($sessions));

// return no content status so it doesnt wait forever
http_response_code(204);