<?php
header('Content-Type: application/json');

// variables and if there is no data for sdp set it to be defaultly null. then if its null return an error
$body = file_get_contents('php://input');
$data = json_decode($body, true);
$offer = $data['sdp'] ?? null;

if (!$offer) {
    http_response_code(400);
    echo json_encode(['error' => 'missing sdp']);
    exit;
}

// load the offers (keys that exist) from sessions file
$file = __DIR__ . '/sessions.json';
$sessions = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

// make a unique 4 digit key
do {
    $key = str_pad(strval(random_int(0, 9999)), 4, '0', STR_PAD_LEFT);
} while (array_key_exists($key, $sessions));

// store the offer in the sessions file, then return the key
$sessions[$key] = [
    'offer' => $offer,
    'answer' => null
];

file_put_contents($file, json_encode($sessions));
echo json_encode(['key' => $key]);
