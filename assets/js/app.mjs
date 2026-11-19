/* Advon Shop — the shop page: a 3-step package builder.
   The cart (ids, variants, quantities, notes) is the only state; the steps are drawn from it.
   Rules: a website always comes with its hosting; add-ons need a website (new, or one you already have). */
import { loadCatalog, cart, quote, DEMO, LS } from './common.mjs';
import { buildStep, hostingStep, extrasStep, clientsBlock, moreBlock, icon, esc } from './render.mjs';
import { euro, UNITS } from './pricing.mjs';
import { formHtml, bindForm, linesHtml, totalsHtml } from './checkout-ui.mjs';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
document.documentElement.classList.add('js');
const MODE = 'advon-shop:mode', COUPON = 'advon-shop:coupon';
let cat, byId, mode = LS.get(MODE, { existing: false, domain: '' }), coupon = LS.get(COUPON, ''), priced = null, chosenV = {};
const P = id => byId.get(id) || {};
const kind = it => P(it.id).kind;

function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2400); }
const saveMode = () => LS.set(MODE, mode);

/* ---------- reading the cart ---------- */
function reqOf(it) { const p = P(it.id), v = (p.variants || []).find(x => x.id === it.v); return (v && v.requires) || p.requires || []; }
function state() {
  const items = cart.items(), b = items.find(i => kind(i) === 'build'), h = items.find(i => kind(i) === 'hosting');
  const vOf = { ...chosenV }; items.forEach(i => { if (i.v) vOf[i.id] = i.v; });
  return { items, build: b && b.id, buildV: b && b.v, existing: !b && mode.existing, domain: mode.domain, hosting: h && h.id, hostOptions: b ? reqOf(b) : [], ids: items.map(i => i.id), vOf };
}

/* ---------- changing the cart ---------- */
function siteNote() { return mode.existing ? mode.domain.trim() : ''; }
function syncNotes(items) { const n = siteNote(), hasB = items.some(i => kind(i) === 'build'); items.forEach(i => { if (P(i.id).needsSite && i.id !== 'changes') i.note = hasB ? '' : n; }); return items; }
function ensureHosting(items) {
  const b = items.find(i => kind(i) === 'build'); let h = items.find(i => kind(i) === 'hosting');
  const opts = b ? reqOf(b) : [];
  if (h && !opts.includes(h.id)) { items.splice(items.indexOf(h), 1); h = null; }
  if (b && opts.length && !h) items.push({ id: opts[0], v: null, qty: 1, note: '' });
  return items;
}
function commit(items, why) { cart.save(syncNotes(ensureHosting(items))); draw(); if (why) toast(why); bump(); }
function bump() { const n = $('#cartN'); n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); }

function pick(id) {
  let items = cart.items();
  const cur = items.find(i => kind(i) === 'build');
  items = items.filter(i => kind(i) !== 'build' && kind(i) !== 'hosting');
  if (cur && cur.id === id) { commit(items, 'Αφαιρέθηκε'); return; }
  const p = P(id); mode.existing = false; saveMode();
  items.unshift({ id, v: p.variants && p.variants.length ? p.variants[0].id : null, qty: 1, note: '' });
  commit(items);
  const h = cart.items().find(i => kind(i) === 'hosting');
  toast(`«${p.name}» + ${h ? P(h.id).name : 'φιλοξενία'} στο πακέτο`);
}
function buildVariant(id, v) { const items = cart.items(); const b = items.find(i => i.id === id); if (b) { b.v = v; commit(items); } }
function host(id) { const items = cart.items().filter(i => kind(i) !== 'hosting'); items.push({ id, v: null, qty: 1, note: '' }); commit(items); }
function setExisting(on) {
  mode.existing = on; saveMode();
  let items = cart.items();
  if (on) items = items.filter(i => kind(i) !== 'build' && kind(i) !== 'hosting');
  commit(items);
  if (on) setTimeout(() => { const d = $('#dom'); d && d.focus(); }, 60);
}
function needSiteFirst(p) {
  const s = state();
  if (!p.needsSite || s.build || s.existing) return false;
  toast('Διαλέξτε πρώτα τι θα φτιάξουμε — ή «Έχω ήδη ιστοσελίδα».');
  const st = $('#vima-1'); st.scrollIntoView({ behavior: 'smooth', block: 'start' }); st.classList.remove('nudge'); void st.offsetWidth; st.classList.add('nudge');
  return true;
}
function toggle(id, v) {
  const p = P(id); let items = cart.items(); const i = items.findIndex(x => x.id === id);
  if (i >= 0) { items.splice(i, 1); commit(items, `Αφαιρέθηκε: ${p.name}`); return; }
  if (needSiteFirst(p)) return;
  items.push({ id, v: v || (p.variants && p.variants.length ? (chosenV[id] || p.variants[0].id) : null), qty: 1, note: '' });
  commit(items, `Στο πακέτο: ${p.name}`);
}
function monthlyVariant(id, v) { chosenV[id] = v; const items = cart.items(); const it = items.find(x => x.id === id); if (it) { it.v = v; commit(items); } else draw(); }

/* ---------- drawing ---------- */
let firstDraw = true;
function draw() {
  const s = state();
  $('#s1').innerHTML = buildStep(cat, s); $('#s2').innerHTML = hostingStep(cat, s); $('#s3').innerHTML = extrasStep(cat, s);
  $('#vima-2').classList.toggle('done', !!s.hosting || s.existing); $('#vima-1').classList.toggle('done', !!s.build || (s.existing && !!s.domain.trim()));
  if (firstDraw) { firstDraw = false; reveal($$('.tile,.host,.xrow,.mcard', $('#paketo'))); }
  $('#cartN').textContent = s.items.length;
  refresh();
}

let q = 0;
async function refresh() {
  const items = cart.items(), my = ++q;
  if (!items.length) { priced = null; paintSum(); return; }
  try { const pr = await quote(items, coupon); if (my !== q) return; priced = pr; } catch (e) { priced = { lines: [], errors: ['Δεν υπάρχει σύνδεση — δοκιμάστε ξανά.'], total: 0, vat: 0, discount: 0 }; }
  paintSum();
}

function laterHtml(pr) {
  const rows = [];
  for (const l of pr.lines) {
    if (l.unit === 'year') rows.push(`<div><b>${esc(l.name)}:</b> ${euro(l.unitPrice)} + ΦΠΑ τον χρόνο, από του χρόνου</div>`);
    else if (l.unit === 'month') rows.push(`<div><b>${esc(l.name)}:</b> ${euro(l.unitPrice)} + ΦΠΑ τον μήνα · χωρίς δέσμευση</div>`);
    else if (l.priceNote && l.id !== 'site' && l.id !== 'stay') rows.push(`<div><b>${esc(l.name)}:</b> ${esc(l.priceNote)}</div>`);
  }
  return rows.length ? `<div class="later"><div style="margin-bottom:4px;color:var(--tx);font-weight:600">Αργότερα</div>${rows.join('')}</div>` : '';
}
function sumBody(pr, { drawer = false } = {}) {
  if (!pr || !pr.lines.length) return `<div class="empty">Διαλέξτε τι θα φτιάξουμε για να ξεκινήσει το πακέτο σας.</div>${pr && pr.errors.length ? `<div class="err">${esc(pr.errors.join(' '))}</div>` : ''}`;
  const lines = pr.lines.map((l, i) => {
    const p = P(l.id), k = p.kind;
    const ctl = k === 'hosting' ? '<span class="lk">Απαραίτητη</span>' : k === 'build' ? `<button class="rm" data-chg-build>Αλλαγή</button>`
      : `${(p.maxQty || 1) > 1 ? `<span class="qty"><button data-q="${i}" data-d="-1" aria-label="Λιγότερα">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1" aria-label="Περισσότερα">+</button></span> ` : ''}<button class="rm" data-rm="${i}">Αφαίρεση</button>`;
    return `<div class="sl"><div><div class="nm">${l.qty > 1 && (p.maxQty || 1) <= 1 ? l.qty + ' × ' : ''}${esc(l.name)}</div>${l.vname ? `<div class="vn">${esc(l.vname)}</div>` : ''}${l.note ? `<div class="nt">για ${esc(l.note)}</div>` : ''}${ctl}</div>
     <div class="am">${l.unitPrice === 0 ? 'Δωρεάν' : euro(l.amount)}${l.unit === 'year' ? '<small>1ος χρόνος</small>' : l.unit === 'month' ? '<small>1ος μήνας</small>' : l.unit === 'once' && l.unitPrice ? '<small>εφάπαξ</small>' : ''}</div></div>`;
  }).join('');
  return `${lines}${totalsHtml(pr)}${laterHtml(pr)}
   <div class="coupon"><input placeholder="Κωδικός έκπτωσης" value="${esc(coupon)}" aria-label="Κωδικός έκπτωσης" data-coupon><button class="btn dark sm" type="button" data-capply>${coupon ? 'Αλλαγή' : 'Εφαρμογή'}</button></div>
   ${pr.coupon ? `<div class="okm">Ο κωδικός ${esc(pr.coupon.code)} εφαρμόστηκε</div>` : ''}
   <div class="err">${esc(pr.errors.join(' '))}</div>
   ${drawer ? '' : `<button class="btn primary lg block" type="button" data-go${pr.errors.length ? ' disabled' : ''}>Ολοκλήρωση ${icon('arrow')}</button><p class="secure">${icon('lock')} Πληρωμή με κάρτα, Apple Pay ή IRIS</p>`}`;
}
function paintSum() {
  const mb = $('#mbar'), n = cart.items().length;
  mb.hidden = !n; $('#mbarT').textContent = priced ? euro(priced.total, { always2: true }) : '0 €'; $('#mbarN').textContent = n;
  $('#mbarE').textContent = priced && priced.errors.length ? priced.errors[0] : '';
  if (drawerOpen) paintDrawer(true);
}

/* ---------- the drawer: summary + checkout ---------- */
let drawerOpen = false, form = null;
function openDrawer() {
  if (!cart.items().length) { toast('Το πακέτο σας είναι άδειο.'); $('#vima-1').scrollIntoView({ behavior: 'smooth' }); return; }
  drawerOpen = true; paintDrawer(); $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); document.body.style.overflow = 'hidden';
  setTimeout(() => $('#drX').focus(), 50);
}
function closeDrawer() { drawerOpen = false; $('#drawer').classList.remove('on'); $('#scrim').classList.remove('on'); document.body.style.overflow = ''; if (location.hash === '#cart') history.replaceState(null, '', location.pathname + location.search); }
function paintDrawer(keepForm) {
  const b = $('#drB');
  const top = `<div class="dsum">${sumBody(priced, { drawer: true })}</div>`;
  if (keepForm && form && b.contains(form)) { b.querySelector('.dsum').outerHTML = top; form._setT && form._setT(); lockPay(); return; }
  b.innerHTML = top + formHtml(cat);
  form = bindForm(b, { items: () => cart.items(), coupon: () => coupon, total: () => priced ? priced.total : null, onPriced: pr => { priced = pr; paintSum(); } });
  lockPay();
}
function lockPay() { const bt = $('#drB button[type=submit]'); if (bt && cat.pay && (cat.pay.stripe || cat.pay.viva || cat.pay.bank)) bt.disabled = !priced || !!priced.errors.length || !priced.lines.length; }

/* ---------- events (one listener for the whole page) ---------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-pick],[data-bv],[data-existing],[data-host],[data-x],[data-mv],[data-mt],[data-solo],[data-chgadd],[data-goexisting],[data-rm],[data-q],[data-chg-build],[data-capply],[data-go]');
  if (!t) return;
  const d = t.dataset;
  if (d.pick) pick(d.pick);
  else if (d.bv) buildVariant(d.bv, d.v);
  else if ('existing' in d) setExisting(!state().existing);
  else if (d.host) host(d.host);
  else if (d.x) toggle(d.x);
  else if (d.mv) monthlyVariant(d.mv, d.v);
  else if (d.mt) toggle(d.mt, chosenV[d.mt]);
  else if (d.solo) { if (cart.items().some(i => i.id === d.solo)) toast('Είναι ήδη στο πακέτο.'); else toggle(d.solo); }
  else if ('chgadd' in d) {
    const dom = $('#chgDom'), v = dom.value.trim();
    if (!/\.[a-z]{2,}/i.test(v)) { toast('Γράψτε τη διεύθυνση της σελίδας σας (π.χ. onoma.gr).'); dom.focus(); return; }
    cart.add({ id: 'changes', qty: 1, note: v }); dom.value = ''; draw(); bump(); toast('Το αίτημα αλλαγών μπήκε στο πακέτο'); openDrawer();
  }
  else if ('goexisting' in d) { e.preventDefault(); setExisting(true); $('#vima-1').scrollIntoView({ behavior: 'smooth' }); }
  else if (d.rm) { const items = cart.items(); const it = priced && priced.lines[+d.rm]; const j = it ? items.findIndex(x => x.id === it.id && (x.v || null) === (it.v || null)) : -1; if (j >= 0) { items.splice(j, 1); commit(items, 'Αφαιρέθηκε'); } }
  else if (d.q) { const it = priced.lines[+d.q], items = cart.items(), j = items.findIndex(x => x.id === it.id && (x.note || '') === (it.note || '')); if (j >= 0) { items[j].qty = Math.max(1, Math.min(P(it.id).maxQty || 1, items[j].qty + +d.d)); commit(items); } }
  else if ('chgBuild' in d) { closeDrawer(); $('#vima-1').scrollIntoView({ behavior: 'smooth' }); }
  else if ('capply' in d) { const inp = t.parentElement.querySelector('[data-coupon]'); coupon = inp.value.trim().toUpperCase(); LS.set(COUPON, coupon); refresh(); }
  else if ('go' in d) openDrawer();
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'dom') {
    mode.domain = e.target.value; saveMode();
    cart.save(syncNotes(cart.items()));
    $('#vima-1').classList.toggle('done', !!mode.domain.trim()); clearTimeout(e.target._t); e.target._t = setTimeout(refresh, 250);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && drawerOpen) closeDrawer();
  if (e.key === 'Enter' && e.target.matches('[data-coupon]')) { e.preventDefault(); e.target.parentElement.querySelector('[data-capply]').click(); }
});
$('#cartBtn').onclick = openDrawer; $('#mbarGo').onclick = openDrawer; $('#mbarOpen').onclick = openDrawer; $('#drX').onclick = closeDrawer; $('#scrim').onclick = closeDrawer;
addEventListener('cart', () => { $('#cartN').textContent = cart.items().length; });
addEventListener('storage', (e) => { if (e.key && e.key.startsWith('advon-shop:')) { mode = LS.get(MODE, mode); draw(); } });

/* ---------- reveal + stars ---------- */
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .04 }) : null;
function reveal(els, kind) {
  els.forEach((el, i) => { el.classList.add('rv'); if (kind) el.classList.add(kind); el.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms'; io ? io.observe(el) : el.classList.add('in'); });
}
function stars() {
  const c = $('#stars'); if (!c || !c.getContext) return;
  const x = c.getContext('2d'), rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr, S = [], raf = 0, last = 0;
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1); w = innerWidth; h = innerHeight; c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(w * h / (w < 700 ? 5200 : 3800));
    S = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() < .08 ? 1.3 + Math.random() * .7 : .4 + Math.random() * .7, a: .25 + Math.random() * .6, t: Math.random() * 6.28, s: .4 + Math.random() * 1.2, v: .02 + Math.random() * .05, c: Math.random() < .2 ? '139,224,252' : '255,255,255' }));
    paint(0);
  }
  function paint(dt) {
    x.clearRect(0, 0, w, h);
    for (const s of S) {
      if (dt) { s.t += dt * .001 * s.s; s.y -= s.v * dt * .06; if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w; } }
      const a = rm ? s.a : s.a * (.55 + .45 * Math.sin(s.t));
      x.fillStyle = `rgba(${s.c},${a.toFixed(3)})`;
      if (s.r < 1) x.fillRect(s.x, s.y, s.r * 1.6, s.r * 1.6); else { x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill(); }
    }
  }
  function loop(ts) { const dt = last ? Math.min(64, ts - last) : 16; last = ts; paint(dt); raf = requestAnimationFrame(loop); }
  size(); addEventListener('resize', () => { clearTimeout(size._t); size._t = setTimeout(size, 150); });
  if (rm) return;
  const go = () => { if (!document.hidden && !raf) { last = 0; raf = requestAnimationFrame(loop); } }, stop = () => { cancelAnimationFrame(raf); raf = 0; };
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : go()); go();
}

/* ---------- start ---------- */
(async function start() {
  stars();
  $$('.hero .w').forEach((w, i) => setTimeout(() => w.classList.add('in'), 120 + i * 180));
  if (DEMO) $('#demobar').hidden = false;
  try { cat = await loadCatalog(); } catch (e) { cat = JSON.parse($('#seed').textContent); cat.pay = {}; toast('Δεν υπάρχει σύνδεση με το κατάστημα.'); }
  byId = new Map((cat.products || []).map(p => [p.id, p]));
  if (cat.settings && cat.settings.notice) { const n = $('#notice'); n.textContent = cat.settings.notice; n.hidden = false; }
  /* drop anything that no longer exists */
  const known = cart.items().filter(i => byId.has(i.id) && P(i.id).active !== false && P(i.id).listed !== false);
  cart.save(syncNotes(ensureHosting(known)));
  $('#clients').innerHTML = clientsBlock(cat); $('#more').innerHTML = moreBlock(cat);
  draw();
  reveal($$('.sech'), 's'); reveal($$('.sh')); reveal($$('.ccard'), 'r'); reveal($$('.mrow'), 'l'); reveal($$('.hw')); reveal($$('#faq details'));
  if (location.hash === '#cart') openDrawer();
})();
