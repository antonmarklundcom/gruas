# VenderCRM private configuration

Let R be the actual public root containing lead-forward.php. Preferred PHP file: parent(realpath(R))/private/vendercrm.php, returning an array with VENDERCRM_URL (HTTPS base origin, without /api/v1/leads) and VENDERCRM_API_KEY. Keep credentials outside public files and archives. Optional VENDERCRM_CONFIG_FILE selects an absolute PHP file physically outside R. Server environment names VENDERCRM_URL/VENDERCRM_API_KEY also work. Populated file/env sources must be complete and agree; unsafe or conflicting settings disable forwarding.

The handler derives /api/v1/leads, preserves its current payload/idempotency key and saves the existing leads.jsonl record before forwarding. Missing cURL, cURL errors and invalid config leave local receipt available. A saved local record counts as received, exactly as before; this is not proof of CRM delivery. Existing leads.jsonl HTTP denial must remain active. No historical records are replayed by this change.

Verify actual serving repository/branch/public root before deployment. Preserve existing leads.jsonl and restrict filesystem/HTTP access. Install settings privately, ensure PHP can read them and cURL is available, then verify an owned form receipt/CRM record after separately authorized deployment. No website-admin CRM settings were found in the reviewed source.

Configuration/handler tests use synthetic temporary fixtures and PHP -n with cURL stubs: no network or customer records. Run node tests/vendercrm-config.cjs with PHP_BINARY pointing to PHP and optionally VENDERCRM_TEST_TMP pointing to a writable temporary directory. Source preparation is separate from merge/deployment/live verification.
