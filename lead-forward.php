<?php
// Reenvía leads del formulario a venderCRM.
// La API key NUNCA vive en este archivo: viene de la variable de entorno
// VENDERCRM_API_KEY configurada en hPanel. Nunca llamar al CRM desde JS.

// ---- honeypot: si viene lleno, es un bot. Cortar antes de todo. ----
if (!empty($_POST['website'])) {
    http_response_code(204);
    exit;
}

// ---- teléfono es obligatorio ----
if (empty($_POST['phone'])) {
    http_response_code(400);
    exit;
}

$ch = curl_init('https://{CRM_DOMAIN}/api/v1/leads');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'X-Api-Key: ' . getenv('VENDERCRM_API_KEY'),
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'phone'           => $_POST['phone'],
        'name'            => $_POST['name'] ?? null,
        'email'           => $_POST['email'] ?? null,
        'message'         => $_POST['message'] ?? null,
        'source'          => 'site:gruas-com-py',
        'page_url'        => $_POST['page_url'] ?? null,
        'idempotency_key' => bin2hex(random_bytes(16)),
    ]),
]);
$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$ok = ($status >= 200 && $status < 300);

// ---- si el submit vino sin JS (POST normal), redirigir ----
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH'])
    || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)
    || (isset($_SERVER['HTTP_SEC_FETCH_MODE']) && $_SERVER['HTTP_SEC_FETCH_MODE'] === 'cors');

if (!$isAjax) {
    header('Location: ' . ($ok ? '/gracias.html' : '/gracias.html?error=1'), true, 303);
    exit;
}

http_response_code($ok ? 200 : 502);
header('Content-Type: application/json');
echo json_encode(['ok' => $ok]);
