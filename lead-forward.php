<?php
// Reenvía leads del formulario a venderCRM.
// La API key NUNCA vive en este archivo: viene de la variable de entorno
// VENDERCRM_API_KEY configurada en hPanel. Nunca llamar al CRM desde JS.
//
// Mientras venderCRM no esté disponible (sin API key, o si el CRM responde
// con error) el lead se guarda igual en leads.jsonl para no perder ninguno.
// Ese archivo queda bloqueado por .htaccess y se importa después.

const VENDERCRM_URL = 'https://crm.clientes.com.py';

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

$phone = substr(trim((string) $_POST['phone']), 0, 30);

// Atribución first-touch que escribe vc-attribution.js (cookie vc_attr).
$attr = isset($_COOKIE['vc_attr']) && is_string($_COOKIE['vc_attr']) ? json_decode($_COOKIE['vc_attr'], true) : null;
if (!is_array($attr)) $attr = [];
$fromAttr = function ($key, $max = 200) use ($attr) {
    return isset($attr[$key]) && is_string($attr[$key]) ? substr(trim($attr[$key]), 0, $max) : null;
};

$lead = [
    'phone'           => $phone,
    'name'            => isset($_POST['name']) ? substr(trim($_POST['name']), 0, 120) : null,
    'email'           => isset($_POST['email']) ? substr(trim($_POST['email']), 0, 160) : null,
    'message'         => isset($_POST['message']) ? substr(trim($_POST['message']), 0, 2000) : null,
    'source'          => 'site:gruas-com-py',
    'page_url'        => isset($_POST['page_url']) ? substr(trim($_POST['page_url']), 0, 300) : null,
    'referrer'        => $fromAttr('referrer', 2000),
    'utm_source'      => $fromAttr('utm_source'),
    'utm_medium'      => $fromAttr('utm_medium'),
    'utm_campaign'    => $fromAttr('utm_campaign'),
    'utm_term'        => $fromAttr('utm_term'),
    'utm_content'     => $fromAttr('utm_content'),
    'gclid'           => $fromAttr('gclid'),
    'fbclid'          => $fromAttr('fbclid'),
    // Estable: mismo teléfono en la misma hora = mismo envío (doble clic, reintento).
    'idempotency_key' => hash('sha256', $phone . '|' . gmdate('Y-m-d-H')),
];
// Omitir vacíos: el CRM rechaza email "" en vez de ignorarlo.
$lead = array_filter($lead, function ($v) { return $v !== null && $v !== ''; });

// ---- copia local: siempre, antes de intentar el envío ----
$stored = @file_put_contents(
    __DIR__ . '/leads.jsonl',
    json_encode($lead + ['received_at' => gmdate('c')], JSON_UNESCAPED_UNICODE) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

// ---- envío al CRM (solo si ya está configurado) ----
$apiKey  = getenv('VENDERCRM_API_KEY');
$sentOk  = false;

if (!empty($apiKey)) {
    $ch = curl_init(VENDERCRM_URL . '/api/v1/leads');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-Api-Key: ' . $apiKey,
        ],
        CURLOPT_POSTFIELDS => json_encode($lead, JSON_UNESCAPED_UNICODE),
    ]);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);
    $sentOk = ($status >= 200 && $status < 300);
    if (!$sentOk) {
        error_log(sprintf('VenderCRM lead failed [%d] %s %s', $status, substr((string) $response, 0, 500), $curlErr));
    }
} else {
    error_log('VenderCRM: VENDERCRM_API_KEY no configurada; lead solo en leads.jsonl');
}

// El lead cuenta como recibido si quedó guardado localmente o si el CRM lo aceptó.
$ok = $sentOk || ($stored !== false);

// ---- si el submit vino sin JS (POST normal), redirigir ----
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH'])
    || (isset($_SERVER['HTTP_SEC_FETCH_MODE']) && $_SERVER['HTTP_SEC_FETCH_MODE'] === 'cors');

if (!$isAjax) {
    header('Location: ' . ($ok ? '/gracias.html' : '/gracias.html?error=1'), true, 303);
    exit;
}

http_response_code($ok ? 200 : 502);
header('Content-Type: application/json');
echo json_encode(['ok' => $ok]);
