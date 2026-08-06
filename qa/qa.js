const { chromium } = require('playwright-core');
const fs = require('fs');
const BASE = 'http://localhost:8899';
const PAGES = ['/', '/404.html', '/gracias.html', '/politica-de-privacidad.html'];
const R = []; // {sec, name, pass, note}
const ok  = (sec,name,note='') => R.push({sec,name,pass:true,note});
const bad = (sec,name,note='') => R.push({sec,name,pass:false,note});

function lum(c){ const [r,g,b]=c.map(v=>{v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});
  return .2126*r+.7152*g+.0722*b; }
function ratio(a,b){ const l1=lum(a),l2=lum(b); return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05); }
function parseRGB(s){ const m=s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/); return m?[+m[1],+m[2],+m[3]]:null; }

(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const noExt = pg => pg.route('**', r => r.request().url().includes('localhost') ? r.continue() : r.abort());

  // ---------- per-page static + DOM checks ----------
  for (const p of PAGES) {
    const ctx = await b.newContext({ viewport:{width:1440,height:1000} });
    const pg = await ctx.newPage(); await noExt(pg);
    const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
    await pg.goto(BASE+p,{waitUntil:'domcontentloaded',timeout:8000});
    await pg.waitForTimeout(300);
    const src = fs.readFileSync('/home/user/gruas'+(p==='/'?'/index.html':p),'utf8');
    const tag=`${p}`;

    // Innehåll
    const ph = src.match(/\[COMPLETAR\]|lorem ipsum|\bTODO\b(?![\s\S]{0,3}el |[\s\S]{0,3}lo )|\bFIXME\b|\bXXX\b/);
    ph ? bad('Innehåll',`Ingen platshållartext ${tag}`,ph[0]) : ok('Innehåll',`Ingen platshållartext ${tag}`);

    // Teknik: h1, landmarks
    const d = await pg.evaluate(()=>({
      h1:document.querySelectorAll('h1').length,
      main:document.querySelectorAll('main').length,
      imgs:[...document.querySelectorAll('img')].map(i=>({alt:i.alt,w:i.getAttribute('width'),h:i.getAttribute('height'),
        lazy:i.getAttribute('loading'),fp:i.getAttribute('fetchpriority'),top:i.getBoundingClientRect().top})),
      canonical:!!document.querySelector('link[rel=canonical]'),
      viewport:!!document.querySelector('meta[name=viewport]'),
      favicon:!!document.querySelector('link[rel=icon]'),
      og:!!document.querySelector('meta[property="og:image"]'),
      robots:(document.querySelector('meta[name=robots]')||{}).content||'',
      bodyFS:getComputedStyle(document.body).fontSize,
      bodyLH:getComputedStyle(document.body).lineHeight,
      telVisible:[...document.querySelectorAll('a[href^="tel:"]')].some(a=>a.textContent.includes('995 628 862')),
      telLinks:document.querySelectorAll('a[href^="tel:"]').length,
    }));
    d.h1===1 ? ok('Teknik',`En h1 ${tag}`) : bad('Teknik',`En h1 ${tag}`,`hittade ${d.h1}`);
    d.canonical||p!=='/'&&p!=='/politica-de-privacidad.html' ? ok('Teknik',`Canonical ${tag}`) : bad('Teknik',`Canonical ${tag}`);
    d.viewport?ok('Teknik',`Viewport ${tag}`):bad('Teknik',`Viewport ${tag}`);
    d.favicon?ok('Teknik',`Favicon ${tag}`):bad('Teknik',`Favicon ${tag}`);
    const noindexOK = (p==='/'||p==='/politica-de-privacidad.html') ? !/noindex/.test(d.robots) : true;
    noindexOK?ok('Teknik',`Ingen noindex på indexerbar sida ${tag}`):bad('Teknik',`Ingen noindex ${tag}`,d.robots);
    const badAlt = d.imgs.filter(i=>!i.alt||!i.alt.trim());
    badAlt.length?bad('Teknik',`Alt-text på alla bilder ${tag}`,`${badAlt.length} saknar`):ok('Teknik',`Alt-text på alla bilder ${tag}`);
    const noDim = d.imgs.filter(i=>!i.w||!i.h);
    noDim.length?bad('Prestanda',`width/height på alla bilder ${tag}`,`${noDim.length} saknar`):ok('Prestanda',`width/height på alla bilder ${tag}`);

    // Typ
    parseFloat(d.bodyFS)>=17?ok('Typ',`Body ≥17px ${tag}`,d.bodyFS):bad('Typ',`Body ≥17px ${tag}`,d.bodyFS);
    const lh=parseFloat(d.bodyLH)/parseFloat(d.bodyFS);
    lh>=1.6?ok('Typ',`line-height ≥1.6 ${tag}`,lh.toFixed(2)):bad('Typ',`line-height ≥1.6 ${tag}`,lh.toFixed(2));

    // Paraguay
    d.telVisible?ok('Paraguay',`Nummer synligt som text ${tag}`):bad('Paraguay',`Nummer synligt som text ${tag}`);
    d.telLinks>0?ok('Paraguay',`Nummer klickbart ${tag}`):bad('Paraguay',`Nummer klickbart ${tag}`);
    const tu = src.match(/\b(tú|tu teléfono|puedes|tienes|quieres|debes)\b/i);
    tu?bad('Paraguay',`Voseo, inga tú-former ${tag}`,tu[0]):ok('Paraguay',`Voseo, inga tú-former ${tag}`);
    const waBad = [...src.matchAll(/wa\.me\/([^"?]+)/g)].filter(m=>m[1]!=='595995628862');
    waBad.length?bad('Paraguay',`wa.me-format ${tag}`,waBad[0][1]):ok('Paraguay',`wa.me-format ${tag}`);
    // no mailto / no third-party endpoint / no api key
    /mailto:/i.test(src)?bad('Teknik',`Ingen mailto ${tag}`):ok('Teknik',`Ingen mailto ${tag}`);
    /api[_-]?key|secret|bearer /i.test(src)?bad('Teknik',`Ingen API-nyckel i klientkod ${tag}`):ok('Teknik',`Ingen API-nyckel i klientkod ${tag}`);
    errs.length?bad('Teknik',`Inga JS-fel ${tag}`,errs[0]):ok('Teknik',`Inga JS-fel ${tag}`);
    await ctx.close();
  }

  // ---------- home-only deep checks ----------
  const ctx = await b.newContext({ viewport:{width:1440,height:1000} });
  const pg = await ctx.newPage(); await noExt(pg);
  await pg.goto(BASE+'/',{waitUntil:'domcontentloaded',timeout:8000});
  await pg.waitForTimeout(400);
  const home = fs.readFileSync('/home/user/gruas/index.html','utf8');

  // hero image not lazy + fetchpriority
  const hero = await pg.evaluate(()=>{ const i=document.querySelector('.p1--hero img');
    return i?{lazy:i.getAttribute('loading'),fp:i.getAttribute('fetchpriority')}:null; });
  (hero && hero.fp==='high' && hero.lazy!=='lazy') ? ok('Prestanda','Hero fetchpriority=high och ej lazy')
    : bad('Prestanda','Hero fetchpriority=high och ej lazy',JSON.stringify(hero));
  const belowFold = await pg.evaluate(()=>[...document.querySelectorAll('img')]
    .filter(i=>i.getBoundingClientRect().top>window.innerHeight)
    .filter(i=>i.getAttribute('loading')!=='lazy').length);
  belowFold===0?ok('Prestanda','Alla bilder under fold är lazy'):bad('Prestanda','Alla bilder under fold är lazy',`${belowFold} utan`);

  // card variants
  const cards = await pg.evaluate(()=>{ const o={};
    ['card--hair','card--raised','card--ink','card--accent','card--bare'].forEach(c=>o[c]=document.querySelectorAll('.'+c).length);
    return o; });
  const used = Object.entries(cards).filter(([,n])=>n>0);
  used.length>=3?ok('Layout','≥3 kortvarianter',JSON.stringify(cards)):bad('Layout','≥3 kortvarianter',JSON.stringify(cards));
  const over = used.filter(([,n])=>n>4);
  over.length?bad('Layout','Ingen kortvariant >4 ggr',JSON.stringify(over)):ok('Layout','Ingen kortvariant >4 ggr',JSON.stringify(cards));

  // structural requirements
  const struct = await pg.evaluate(()=>({
    bleed:document.querySelectorAll('.bleed,.p8,.p6').length,
    overlap:document.querySelectorAll('.p6__panel').length,
    statement:document.querySelectorAll('.statement').length,
  }));
  struct.bleed>=1?ok('Layout','≥1 full-bleed'):bad('Layout','≥1 full-bleed');
  struct.overlap>=1?ok('Layout','≥1 avsiktligt överlapp'):bad('Layout','≥1 avsiktligt överlapp');
  struct.statement===1?ok('Layout','Exakt 1 oversized statement'):bad('Layout','Exakt 1 oversized statement',String(struct.statement));

  // reveal budget
  const rb = await pg.evaluate(()=>({r:document.querySelectorAll('[data-reveal]').length,t:document.querySelectorAll('*').length}));
  const pct=rb.r/rb.t*100;
  pct<=15?ok('Rörelse','≤15 % animerar',`${pct.toFixed(1)} %`):bad('Rörelse','≤15 % animerar',`${pct.toFixed(1)} %`);

  // hero text has no reveal
  const heroRev = await pg.evaluate(()=>document.querySelectorAll('.p1--hero [data-reveal]').length);
  heroRev===0?ok('Rörelse','Ingen entré-animation på hero-text'):bad('Rörelse','Ingen entré-animation på hero-text',String(heroRev));

  // WhatsApp green only inside glyph
  const waMisuse = await pg.evaluate(()=>{
    let n=0; document.querySelectorAll('*').forEach(e=>{ const s=getComputedStyle(e);
      const g='rgb(37, 211, 102)';
      if((s.backgroundColor===g||s.borderTopColor===g&&s.borderTopWidth!=='0px'||s.color===g) && e.tagName!=='svg' && e.tagName!=='path') n++; });
    return n; });
  waMisuse===0?ok('Färg','#25D366 endast i WhatsApp-glyfen'):bad('Färg','#25D366 endast i WhatsApp-glyfen',`${waMisuse} element`);

  // muted text contrast
  const contrast = await pg.evaluate(()=>{
    const out=[];
    document.querySelectorAll('p,.small,.lead,li,dd,summary').forEach(e=>{
      if(!e.textContent.trim()) return;
      const s=getComputedStyle(e); let bg=null,n=e;
      while(n && n!==document.documentElement){ const c=getComputedStyle(n).backgroundColor;
        if(c && c!=='rgba(0, 0, 0, 0)'){ bg=c; break; } n=n.parentElement; }
      out.push({fg:s.color,bg:bg||'rgb(14,14,15)',fs:parseFloat(s.fontSize),tag:e.className||e.tagName});
    });
    return out; });
  const failC = contrast.filter(c=>{ const f=parseRGB(c.fg),g=parseRGB(c.bg); if(!f||!g) return false;
    const need = c.fs>=24 ? 3 : 4.5; return ratio(f,g) < need; });
  failC.length?bad('Färg','Dämpad text ≥4.5:1',`${failC.length} element, sämst ${Math.min(...failC.map(c=>ratio(parseRGB(c.fg),parseRGB(c.bg)))).toFixed(2)}:1 (${failC[0].tag})`)
    :ok('Färg','Dämpad text ≥4.5:1',`${contrast.length} element kontrollerade`);

  // form contract
  const form = await pg.evaluate(()=>{ const f=document.querySelector('[data-lead-form]');
    return f?{action:f.getAttribute('action'),method:f.method,
      names:[...f.querySelectorAll('[name]')].map(i=>i.name)}:null; });
  (form&&form.action==='/lead-forward.php')?ok('Teknik','Formuläret postar till lead-forward.php')
    :bad('Teknik','Formuläret postar till lead-forward.php',JSON.stringify(form));
  const needNames=['name','phone','message','page_url','website'];
  const missing=form?needNames.filter(n=>!form.names.includes(n)):needNames;
  missing.length?bad('Teknik','Formulärkontrakt intakt',`saknar ${missing}`):ok('Teknik','Formulärkontrakt intakt');

  // consent: nothing pre-checked
  const consent = await pg.evaluate(()=>{ const c=document.querySelector('[data-consent]');
    return c?{exists:true,checked:c.querySelectorAll('input:checked').length}:{exists:false}; });
  (consent.exists&&consent.checked===0)?ok('Paraguay','Consent-banner utan förikryssat')
    :bad('Paraguay','Consent-banner utan förikryssat',JSON.stringify(consent));

  // analytics events actually fire with page_path
  const ev = await pg.evaluate(()=>{ window.dataLayer=[];
    document.querySelector('[data-ev="whatsapp_click"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
    document.querySelector('[data-ev="call_click"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
    return window.dataLayer.map(d=>({e:d.event,p:d.page_path!==undefined})); });
  const evOK = ev.length>=2 && ev.every(x=>x.p);
  evOK?ok('Teknik','whatsapp_click/call_click avfyras med page_path',JSON.stringify(ev.map(e=>e.e)))
    :bad('Teknik','Analytics-event avfyras',JSON.stringify(ev));

  // internal links that 404
  const links = await pg.evaluate(()=>[...new Set([...document.querySelectorAll('a[href^="/"]')].map(a=>a.getAttribute('href')))]);
  const dead=[];
  for(const l of links){ const r=await pg.request.get(BASE+l).catch(()=>null);
    if(!r||r.status()>=400) dead.push(l); }
  dead.length?bad('Teknik','Inga döda interna länkar',`${dead.length}: ${dead.join(' ')}`)
    :ok('Teknik','Inga döda interna länkar');
  await ctx.close();

  // ---------- reduced motion ----------
  const rctx = await b.newContext({ viewport:{width:1440,height:1000}, reducedMotion:'reduce' });
  const rpg = await rctx.newPage(); await noExt(rpg);
  await rpg.goto(BASE+'/',{waitUntil:'domcontentloaded',timeout:8000});
  await rpg.waitForTimeout(400);
  const rm = await rpg.evaluate(()=>[...document.querySelectorAll('[data-reveal]')]
    .filter(e=>getComputedStyle(e).opacity!=='1').length);
  rm===0?ok('Rörelse','prefers-reduced-motion stänger av allt — testat')
    :bad('Rörelse','prefers-reduced-motion stänger av allt',`${rm} dolda`);
  await rctx.close();

  // ---------- overlap / overflow at spec widths ----------
  for(const w of [360,768,1280,1920]){
    const c2=await b.newContext({viewport:{width:w,height:1000}});
    const p2=await c2.newPage(); await noExt(p2);
    await p2.goto(BASE+'/',{waitUntil:'domcontentloaded',timeout:8000});
    await p2.waitForTimeout(250);
    const r2=await p2.evaluate(()=>({s:document.documentElement.scrollWidth,c:document.documentElement.clientWidth}));
    r2.s<=r2.c?ok('Layout',`Inget överlapp/överflöd @${w}`):bad('Layout',`Inget överlapp/överflöd @${w}`,`${r2.s}>${r2.c}`);
    await c2.close();
  }

  await b.close();

  // ---------- report ----------
  const secs=[...new Set(R.map(r=>r.sec))];
  let md='';
  for(const s of secs){
    md+=`\n### ${s}\n\n`;
    for(const r of R.filter(x=>x.sec===s)) md+=`- [${r.pass?'x':' '}] ${r.name}${r.note?` — ${r.note}`:''}\n`;
  }
  fs.writeFileSync('qa-body.md',md);
  const fails=R.filter(r=>!r.pass);
  console.log(md);
  console.log(`\n==== ${R.length-fails.length}/${R.length} godkända, ${fails.length} fel ====`);
})();
