/* ==========================================================================
   gruas.com.py — JS compartido
   1. motion.js de web-design-system, copiado VERBATIM
   2. shim de analítica (data-ev) — no carga nada, no requiere cuenta
   3. número de WhatsApp: UNA sola constante (§10.5) — cambiarlo es una línea
   4. cotizador (P10)
   5. banner de consentimiento
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. web-design-system — motion.js. Copy verbatim. No dependencies. ~2KB.
      Budget: at most 15% of elements should carry data-reveal.
   -------------------------------------------------------------------------- */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var d = document;

  // 1. Scroll reveal with capped stagger -------------------------------
  var items = d.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
  } else {
    items.forEach(function (el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 280ms cubic-bezier(.16,1,.3,1), transform 280ms cubic-bezier(.16,1,.3,1)';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = Math.min(+(e.target.dataset.reveal || 0), 6); // cap stagger at 6
        e.target.style.transitionDelay = (i * 70) + 'ms';
        e.target.style.opacity = 1;
        e.target.style.transform = 'none';
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  }

  // 2. Count-up on numbers --------------------------------------------
  var nums = d.querySelectorAll('[data-count]');
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, to = parseFloat(el.dataset.count), t0 = null;
        var suffix = el.dataset.countSuffix || '';
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 900, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(to * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        nio.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { nio.observe(el); });
  }

  // 3. Sticky header state --------------------------------------------
  var hdr = d.querySelector('[data-sticky-header]');
  if (hdr) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        hdr.classList.toggle('is-stuck', window.scrollY > 24);
        tick = false;
      });
    }, { passive: true });
  }
})();

/* --------------------------------------------------------------------------
   2. Shim de analítica — ~350 bytes, no carga nada.
      El día que entre GTM/GA4/Plausible, todos los eventos históricos
      ya tienen el mismo nombre y la misma ubicación.
   -------------------------------------------------------------------------- */
(function(){
  window.dataLayer = window.dataLayer || [];
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-ev]');
    if (!t) return;
    window.dataLayer.push({
      event: t.dataset.ev,
      ev_loc: t.dataset.evLoc || '',
      page_path: location.pathname,
      site: location.hostname
    });
  }, true);
})();

/* --------------------------------------------------------------------------
   3. Número de WhatsApp — ÚNICO lugar del código donde vive.
      Al cambiar de número por sitio, se edita solo esta línea.
   -------------------------------------------------------------------------- */
var GRUAS = (function(){
  var WA_NUMBER = '595995628862';

  /* Construye el enlace de WhatsApp con el mensaje precargado que identifica
     sitio y página. Es la única atribución que tiene un sitio estático. */
  function waLink(mensaje){
    return 'https://wa.me/' + WA_NUMBER +
           '?text=' + encodeURIComponent('Hola, vengo de gruas.com.py — ' + mensaje);
  }

  return { number: WA_NUMBER, waLink: waLink };
})();

/* --------------------------------------------------------------------------
   4. Cotizador (P10)
      NO calcula ni muestra precios: el sitio declara públicamente que no
      publica lista de precios. Lo que hace es armar el mensaje de WhatsApp
      completo — ubicación, vehículo, situación y destino — para que el
      presupuesto cerrado se pase en un solo ida y vuelta.
   -------------------------------------------------------------------------- */
(function(){
  var form = document.querySelector('[data-cotizador]');
  if (!form) return;

  var out   = form.querySelector('[data-cotizador-out]');
  var resum = form.querySelector('[data-cotizador-resumen]');
  var link  = form.querySelector('[data-cotizador-wa]');
  var opened = false;

  /* calc_open se dispara una sola vez, en la primera interacción real */
  form.addEventListener('change', function(){
    if (!opened) {
      opened = true;
      window.dataLayer.push({
        event: 'calc_open', ev_loc: 'cotizador',
        page_path: location.pathname, site: location.hostname
      });
    }
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();

    var data = new FormData(form);
    var situacion = data.get('situacion');
    var vehiculo  = data.get('vehiculo');
    var zona      = data.get('zona');
    var destino   = (data.get('destino') || '').trim();

    if (!situacion || !vehiculo || !zona) return;

    var partes = [
      'Situación: ' + situacion,
      'Vehículo: ' + vehiculo,
      'Estoy en: ' + zona
    ];
    if (destino) partes.push('Lo llevamos a: ' + destino);

    resum.innerHTML = partes.map(function(p){
      return '<li>' + p.replace(/[<>]/g, '') + '</li>';
    }).join('');

    link.href = GRUAS.waLink(
      partes.join('. ') + '. Te mando la ubicación por acá.'
    );

    out.hidden = false;
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    window.dataLayer.push({
      event: 'calc_complete', ev_loc: 'cotizador',
      page_path: location.pathname, site: location.hostname
    });
  });
})();

/* --------------------------------------------------------------------------
   5. Banner de consentimiento — Ley 6534/2020.
      Nada premarcado. "Seguir sin aceptar" es una opción real y equivalente.
   -------------------------------------------------------------------------- */
(function(){
  var el = document.querySelector('[data-consent]');
  if (!el) return;

  var KEY = 'gruas-consent';
  var stored;
  try { stored = localStorage.getItem(KEY); } catch (err) { stored = 'skip'; }
  if (stored) return;

  el.hidden = false;

  el.addEventListener('click', function(e){
    var btn = e.target.closest('[data-consent-choice]');
    if (!btn) return;
    try { localStorage.setItem(KEY, btn.dataset.consentChoice); } catch (err) {}
    el.hidden = true;
  });
})();

/* --------------------------------------------------------------------------
   6. Formulario de contacto — envío sin recarga cuando hay JS.
      Sin JS el POST normal funciona igual y lead-forward.php redirige.
   -------------------------------------------------------------------------- */
(function(){
  var form = document.querySelector('[data-lead-form]');
  if (!form) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var btn = form.querySelector('[type="submit"]');
    var estado = form.querySelector('[data-lead-estado]');

    var pageUrl = form.querySelector('[name="page_url"]');
    if (pageUrl) pageUrl.value = location.href;

    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(function(r){ return r.ok; })
    .then(function(ok){
      if (ok) {
        window.location.href = '/gracias.html';
      } else {
        throw new Error('fallo');
      }
    })
    .catch(function(){
      if (btn) { btn.disabled = false; btn.textContent = 'Enviar consulta'; }
      if (estado) {
        estado.textContent = 'No se pudo enviar. Escribinos por WhatsApp al ' +
                             '+595 995 628 862 y lo resolvemos ahí.';
      }
    });
  });
})();
