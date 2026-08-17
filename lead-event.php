<?php
// Registro propio de eventos de contacto (clic a WhatsApp, clic a llamar).
//
// Por qué existe: en un sitio que vende leads, el clic a wa.me se va a un
// dominio ajeno y no deja rastro. Sin este registro no hay forma de decirle
// a la grúa que compra los leads cuántos fueron, de qué zona y de qué página
// salieron — y no hay forma de auditarlo si el comprador lo discute.
//
// NO guarda datos personales: ni teléfono, ni nombre, ni el texto que la
// persona escriba después dentro de WhatsApp. Sólo qué botón se tocó, en qué
// página, desde qué campaña y qué respondió en el cotizador.
//
// El archivo lead-events.jsonl queda bloqueado por .htaccess (FilesMatch
// \.jsonl$), igual que leads.jsonl.

header('Content-Type: application/json');

// sendBeacon manda el cuerpo crudo; también aceptamos POST normal.
$raw = file_get_contents('php://input', false, null, 0, 8192);
$in  = json_decode($raw, true);
if (!is_array($in)) { $in = $_POST; }
if (!is_array($in) || empty($in['event'])) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

// Lista blanca: cualquier otro nombre de evento se descarta. Evita que el
// archivo se llene con basura si alguien encuentra el endpoint.
$allowed = ['whatsapp_click', 'call_click', 'calc_submit', 'form_submit'];
if (!in_array($in['event'], $allowed, true)) {
    http_response_code(422);
    echo json_encode(['ok' => false]);
    exit;
}

function field($arr, $key, $max) {
    if (!isset($arr[$key]) || !is_string($arr[$key])) return null;
    $v = trim($arr[$key]);
    return $v === '' ? null : mb_substr($v, 0, $max);
}

$row = [
    'event'      => field($in, 'event', 40),
    'loc'        => field($in, 'loc', 60),        // en qué bloque de la página
    'page'       => field($in, 'page', 200),
    'referrer'   => field($in, 'referrer', 200),
    'utm_source' => field($in, 'utm_source', 80),
    'utm_medium' => field($in, 'utm_medium', 80),
    'utm_campaign' => field($in, 'utm_campaign', 80),
    // Respuestas del cotizador: esto es lo que convierte un clic en un lead
    // vendible — la grúa sabe qué pasó, qué vehículo es y de qué zona sale.
    'situacion'  => field($in, 'situacion', 80),
    'vehiculo'   => field($in, 'vehiculo', 60),
    'zona'       => field($in, 'zona', 60),
    'destino'    => field($in, 'destino', 120),
    'viewport'   => field($in, 'viewport', 20),
    'received_at' => gmdate('c'),
];

$ok = @file_put_contents(
    __DIR__ . '/lead-events.jsonl',
    json_encode($row, JSON_UNESCAPED_UNICODE) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

http_response_code($ok === false ? 500 : 204);
