/* Advon Shop — the store page.
   The cart (ids, variants, quantities, notes) is the only state that matters; everything is drawn from it.
   Rules: a website always comes with its hosting; a package replaces the services it contains;
   add-ons ask «for which website?» when there is no new website in the cart. */
import { loadCatalog, cart, quote, DEMO, LS } from './common.mjs';
import { grid, hostingStrip, bundles, extras, clientsBlock, moreBlock, details, upRow, icon, esc, byId, includesTxt } from './render.mjs';
import { euro } from './pricing.mjs';
import { formHtml, bindForm, totalsHtml } from './checkout-ui.mjs';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
document.documentElement.classList.add('js');
const COUPON = 'advon-shop:coupon';
let cat, coupon = LS.get(COUPON, ''), priced = null, chosenV = {}, hostSel = {}, modalId = null, drStep = 'cart', form = null;
const P = id => byId(cat, id) || {};
const kind = it => P(it.id).kind;

function toast(m) { const t = $('#toast'); t.innerHTML = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600); }
function bump() { const n = $('#cartN'); n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); }
function st() { const items = cart.items(), vOf = { ...chosenV }; items.forEach(i => { if (i.v) vOf[i.id] = i.v; }); return { items, ids: items.map(i => i.id), vOf, hostSel: hostSel[modalId] }; }

/* ---------- the rules ---------- */
function reqOf(it) { const p = P(it.id), v = (p.variants || []).find(x => x.id === it.v); return (v && v.requires) || p.requires || []; }
function ensureHosting(items) {
  const b = items.find(i => kind(i) === 'build'); let h = items.find(i => kind(i) === 'hosting');
  const opts = b ? reqOf(b) : [];
  if (h && !opts.includes(h.id)) { items.splice(items.indexOf(h), 1); h = null; }
  if (b && opts.length && !h) items.push({ id: hostSel[b.id] && opts.includes(hostSel[b.id]) ? hostSel[b.id] : opts[0], v: null, qty: 1, note: '' });
  return items;
}
function commit(items) { cart.save(ensureHosting(items)); draw(); bump(); }
const blockerOf = id => cart.items().map(i => P(i.id)).find(q => (q.notWith || []).includes(id));

function add(id, { open = true } = {}) {
  const p = P(id); if (!p.id) return;
  if (p.kind === 'build') return openModal(id);
  let items = cart.items();
  if (items.some(i => i.id === id)) { if (open) openDrawer(); return; }
  const b = blockerOf(id);
  if (b && b.kind === 'bundle' && p.kind !== 'bundle') { toast(`Περιλαμβάνεται ήδη στο πακέτο «${esc(b.name)}».`); return; }
  if (b && p.kind !== 'bundle') { toast(`Περιλαμβάνεται ήδη στο «${esc(b.name)}».`); return; }
  let removed = [];
  if (p.notWith && p.notWith.length) { removed = items.filter(i => p.notWith.includes(i.id)).map(i => P(i.id).name); items = items.filter(i => !p.notWith.includes(i.id)); }
  items.push({ id, v: p.variants && p.variants.length ? (chosenV[id] || p.variants[0].id) : null, qty: 1, note: '' });
  commit(items);
  if (removed.length) toast(`Το πακέτο «${esc(p.name)}» αντικατέστησε: ${esc(removed.join(', '))}`);
  if (open) openDrawer(); else if (!removed.length) toast(`${icon('check')} Στο καλάθι: ${esc(p.name)}`);
}
function buyBuild(id) {
  const p = P(id), v = p.variants && p.variants.length ? (chosenV[id] || p.variants[0].id) : null;
  let items = cart.items().filter(i => kind(i) !== 'build' && kind(i) !== 'hosting');
  items.unshift({ id, v, qty: 1, note: '' });
  items.forEach(i => { if (P(i.id).needsSite && i.id !== 'changes') i.note = ''; });
  commit(items); closeModal(); openDrawer();
}
function remove(id) {
  let items = cart.items().filter(i => i.id !== id);
  if (P(id).kind === 'build') items = items.filter(i => kind(i) !== 'hosting');
  commit(items);
}
function setVariant(id, v) {
  chosenV[id] = v;
  const items = cart.items(), it = items.find(i => i.id === id);
  if (it) { it.v = v; commit(items); } else draw();
}

/* ---------- drawing the page ---------- */
function draw() {
  const s = st();
  $('#g-site').innerHTML = grid(cat, 'site', s); $('#g-eshop').innerHTML = grid(cat, 'eshop', s); $('#g-social').innerHTML = grid(cat, 'social', s);
  $('#g-ads').innerHTML = grid(cat, 'ads', s); $('#g-bundles').innerHTML = bundles(cat, s); $('#g-extras').innerHTML = extras(cat, s); $('#g-more').innerHTML = moreBlock(cat, s);
  $('#cartN').textContent = s.items.length;
  if (modalId) paintModal();
  refresh();
}
let q = 0;
async function refresh() {
  const items = cart.items(), my = ++q;
  if (!items.length) { priced = null; paint(); return; }
  try { const pr = await quote(items, coupon); if (my !== q) return; priced = pr; } catch (e) { priced = { lines: [], errors: ['Δεν υπάρχει σύνδεση — δοκιμάστε ξανά.'], total: 0, vat: 0, discount: 0 }; }
  paint();
}
function paint() {
  const n = cart.items().length, mb = $('#mbar');
  mb.hidden = !n || drawerOpen; $('#mbarN').textContent = n; $('#mbarT').textContent = priced ? euro(priced.total, { always2: true }) : '0 €';
  $('#mbarE').textContent = priced && priced.errors.length ? priced.errors[0] : '';
  if (drawerOpen) paintDrawer();
}

/* ---------- product details ---------- */
const UPS = { site: ['social', 'ads', 'form'], stay: ['meta', 'gbp', 'booking'], eshop: ['meta', 'social', 'gbp'], social: ['meta', 'b-grow', 'gbp'], meta: ['social', 'b-start', 'ads'], ads: ['meta', 'gbp', 'form'],
  'b-start': ['site', 'gbp'], 'b-grow': ['site', 'gbp'], 'b-full': ['site', 'gbp'] };
let lastFocus = null;
function openModal(id) {
  modalId = id; lastFocus = document.activeElement;
  const p = P(id); if (p.kind === 'build' && !hostSel[id]) { const b = cart.items().find(i => i.id === id), h = cart.items().find(i => kind(i) === 'hosting'); if (b && h) hostSel[id] = h.id; }
  paintModal(); const m = $('#modal'); m.hidden = false; requestAnimationFrame(() => m.classList.add('on')); document.body.classList.add('lock');
  $('#mdB').scrollTop = 0; $('.mbox').scrollTop = 0;
  setTimeout(() => $('#mdX').focus(), 60);
}
function paintModal() {
  const p = P(modalId), s = st();
  s.ups = (UPS[modalId] || (p.cat === 'extras' || p.cat === 'more' ? ['site', 'social'] : [])).filter(x => x !== modalId);
  $('#mdB').innerHTML = details(cat, p, s);
}
function closeModal() { const m = $('#modal'); m.classList.remove('on'); if (!drawerOpen) document.body.classList.remove('lock'); setTimeout(() => { if (!modalId) m.hidden = true; }, 220); modalId = null; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }

/* ---------- the cart drawer ---------- */
let drawerOpen = false;
function openDrawer() { drawerOpen = true; drStep = 'cart'; paintDrawer(); $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); document.body.classList.add('lock'); $('#mbar').hidden = true; setTimeout(() => $('#drX').focus(), 60); }
function closeDrawer() { drawerOpen = false; $('#drawer').classList.remove('on'); $('#scrim').classList.remove('on'); document.body.classList.remove('lock'); paint(); if (location.hash === '#cart') history.replaceState(null, '', location.pathname + location.search); }

function suggestions() {
  const ids = cart.items().map(i => i.id), has = id => ids.includes(id);
  const b = cart.items().find(i => kind(i) === 'build');
  const c = [];
  if (has('social') && !has('meta')) c.push('b-grow');
  if (has('meta') && !has('social')) c.push('b-start');
  if (!b) c.push('site');
  if (b && b.id === 'eshop') c.push('meta', 'social', 'gbp');
  else if (b) c.push(has('social') || has('meta') ? 'ads' : 'b-grow', 'form', 'gbp', 'ads');
  c.push('social', 'gbp', 'booking');
  return [...new Set(c)].filter(id => P(id).id && !has(id) && !blockerOf(id)).slice(0, 3);
}
function lineHtml(l, hasBuild) {
  const p = P(l.id), k = p.kind, img = p.img ? p.img.replace(/\.webp$/, '-600.webp') : '';
  const thumb = img ? `<img src="${esc(img)}" width="84" height="63" alt="" loading="lazy">` : `<span class="pic sm">${icon(k === 'hosting' ? 'shield' : (p.icon || 'file'))}</span>`;
  let extra = '';
  if (k === 'hosting') { const b = cart.items().find(x => kind(x) === 'build'), opts = b ? reqOf(b) : [];
    extra = opts.length > 1 ? `<div class="hsw">${opts.map(id => `<button type="button" class="vchip${id === l.id ? ' on' : ''}" data-hswap="${esc(id)}">${esc(P(id).name)} · ${euro(P(id).price)}</button>`).join('')}</div>` : ''; }
  if (p.needsSite && !hasBuild && l.id !== 'renew') extra += `<label class="nfield"><span>Για ποια ιστοσελίδα;</span><input data-note="${esc(l.id)}" value="${esc(l.note || '')}" placeholder="π.χ. onoma.gr" inputmode="url" autocomplete="url"></label>`;
  const ctl = k === 'hosting' ? '<span class="lk">Απαραίτητη</span>'
    : `${(p.maxQty || 1) > 1 ? `<span class="qty"><button data-q="${esc(l.id)}" data-d="-1" aria-label="Λιγότερα">−</button><span>${l.qty}</span><button data-q="${esc(l.id)}" data-d="1" aria-label="Περισσότερα">+</button></span>` : ''}<button class="rm" data-rm="${esc(l.id)}">Αφαίρεση</button>`;
  const unit = l.unit === 'year' ? 'για 1 χρόνο' : l.unit === 'month' ? 'ο 1ος μήνας' : l.unit === 'request' ? 'ανά αίτημα' : 'εφάπαξ';
  return `<div class="cl2">${thumb}<div class="clb"><div class="clt"><b>${esc(l.name)}</b><span class="am">${l.unitPrice === 0 && k === 'build' ? 'Δωρεάν' : euro(l.amount)}</span></div>
   ${l.vname ? `<div class="vn">${esc(l.vname)}</div>` : ''}${k === 'bundle' ? `<div class="vn">${esc((p.includes || []).map(r => includesTxt(cat, r)).join(' + '))}</div>` : ''}
   <div class="clm"><small>${l.unitPrice ? unit + ' · + ΦΠΑ' : ''}</small>${ctl}</div>${extra}</div></div>`;
}
function laterHtml(pr) {
  const rows = [];
  for (const l of pr.lines) {
    const p = P(l.id);
    if (l.unit === 'year') rows.push(`<div><b>${esc(l.name)}:</b> ${euro(l.unitPrice)} + ΦΠΑ τον χρόνο, από του χρόνου</div>`);
    else if (l.unit === 'month' && l.unitPrice) rows.push(`<div><b>${esc(l.name)}:</b> ${euro(l.unitPrice)} + ΦΠΑ τον μήνα · χωρίς δέσμευση</div>`);
    else if (p.priceNote && p.kind !== 'build') rows.push(`<div><b>${esc(l.name)}:</b> ${esc(p.priceNote)}</div>`);
  }
  return rows.length ? `<div class="later"><div class="lh">Αργότερα</div>${rows.join('')}</div>` : '';
}
function paintDrawer() {
  const b = $('#drB'), items = cart.items();
  $('#drT').textContent = drStep === 'pay' ? 'Ολοκλήρωση αγοράς' : 'Το καλάθι σας';
  if (!items.length) {
    drStep = 'cart';
    b.innerHTML = `<div class="emptyc">${icon('cart')}<b>Το καλάθι σας είναι άδειο</b><p>Ξεκινήστε από αυτά που διαλέγουν οι περισσότεροι:</p></div><div class="upl">${['site', 'social', 'b-grow'].map(id => upRow(cat, P(id), st())).join('')}</div>`;
    return;
  }
  if (!priced) { b.innerHTML = '<p class="small" style="padding:20px 0">Υπολογίζουμε…</p>'; return; }
  const hasBuild = items.some(i => kind(i) === 'build');
  const focusNote = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.note;
  const summary = `<div class="clines">${priced.lines.map(l => lineHtml(l, hasBuild)).join('')}</div>${totalsHtml(priced)}${laterHtml(priced)}`;
  if (drStep === 'pay') {
    if (form && b.contains(form)) { b.querySelector('.dsum').innerHTML = summary; form._setT && form._setT(); lockPay(); return; }
    b.innerHTML = `<button class="back" type="button" data-back>← Πίσω στο καλάθι</button><details class="dsumw"><summary>Τι αγοράζετε · <b>${euro(priced.total, { always2: true })}</b></summary><div class="dsum">${summary}</div></details>` + formHtml(cat);
    form = bindForm(b, { items: () => cart.items(), coupon: () => coupon, total: () => priced ? priced.total : null, onPriced: pr => { priced = pr; paint(); } });
    lockPay(); return;
  }
  const sug = suggestions();
  b.innerHTML = `${summary}
   <div class="coupon"><input placeholder="Κωδικός έκπτωσης" value="${esc(coupon)}" aria-label="Κωδικός έκπτωσης" data-coupon><button class="btn ghost sm" type="button" data-capply>${coupon ? 'Αλλαγή' : 'Εφαρμογή'}</button></div>
   ${priced.coupon ? `<div class="okm">${icon('check')} Ο κωδικός ${esc(priced.coupon.code)} εφαρμόστηκε</div>` : ''}
   <div class="err">${esc(priced.errors.join(' '))}</div>
   <button class="btn primary lg block" type="button" data-pay ${priced.errors.length ? 'disabled' : ''}>${icon('lock')} Ολοκλήρωση αγοράς · ${euro(priced.total, { always2: true })}</button>
   <p class="secure">Κάρτα · Apple Pay · Google Pay · IRIS — με τιμολόγιο</p>
   ${sug.length ? `<div class="sugg"><h3>Προτείνουμε μαζί</h3><div class="upl">${sug.map(id => upRow(cat, P(id), st())).join('')}</div></div>` : ''}`;
  if (focusNote) { const inp = b.querySelector(`[data-note="${focusNote}"]`); if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } }
}
function lockPay() { const bt = $('#drB button[type=submit]'); if (bt && cat.pay && (cat.pay.stripe || cat.pay.viva || cat.pay.bank)) bt.disabled = !priced || !!priced.errors.length || !priced.lines.length; }

/* ---------- events ---------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-open],[data-add],[data-buy],[data-pv],[data-hsel],[data-hswap],[data-rm],[data-q],[data-capply],[data-pay],[data-back],[data-chgadd]');
  if (!t) return;
  const d = t.dataset;
  if (d.add) {
    const inDrawer = !!t.closest('.drawer'), inModal = !!t.closest('.modal');
    if (t.classList.contains('sm') && !inDrawer && !inModal && cart.items().some(i => i.id === d.add)) { remove(d.add); toast('Αφαιρέθηκε'); }
    else if (!t.classList.contains('sm') && !inDrawer && !inModal && cart.items().some(i => i.id === d.add)) openDrawer();
    else add(d.add, { open: false });
  }
  else if (d.open) { e.preventDefault(); if (drawerOpen) closeDrawer(); openModal(d.open); }
  else if (d.buy) { const p = P(d.buy); if (p.kind === 'build') buyBuild(d.buy); else if (cart.items().some(i => i.id === d.buy)) { closeModal(); openDrawer(); } else { add(d.buy, { open: false }); } }
  else if (d.pv) setVariant(d.pv, d.v);
  else if (d.hsel) { hostSel[modalId] = d.hsel; paintModal(); }
  else if (d.hswap) { const items = cart.items().filter(i => kind(i) !== 'hosting'); items.push({ id: d.hswap, v: null, qty: 1, note: '' }); const b = items.find(i => kind(i) === 'build'); if (b) hostSel[b.id] = d.hswap; commit(items); }
  else if (d.rm) remove(d.rm);
  else if (d.q) { const items = cart.items(), it = items.find(i => i.id === d.q); if (it) { it.qty = Math.max(1, Math.min(P(it.id).maxQty || 1, it.qty + +d.d)); commit(items); } }
  else if ('capply' in d) { coupon = t.parentElement.querySelector('[data-coupon]').value.trim().toUpperCase(); LS.set(COUPON, coupon); refresh(); }
  else if ('pay' in d) { drStep = 'pay'; form = null; paintDrawer(); $('#drB').scrollTop = 0; }
  else if ('back' in d) { drStep = 'cart'; paintDrawer(); }
  else if ('chgadd' in d) {
    const dom = $('#chgDom'), v = dom.value.trim();
    if (!/\.[a-z]{2,}/i.test(v)) { toast('Γράψτε τη διεύθυνση της σελίδας σας (π.χ. onoma.gr).'); dom.focus(); return; }
    cart.add({ id: 'changes', qty: 1, note: v }); dom.value = ''; draw(); bump(); openDrawer();
  }
});
document.addEventListener('input', (e) => {
  const n = e.target.dataset && e.target.dataset.note;
  if (n) { const items = cart.items(), it = items.find(i => i.id === n); if (it) { it.note = e.target.value; cart.save(items); clearTimeout(e.target._t); e.target._t = setTimeout(refresh, 400); } }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (modalId) closeModal(); else if (drawerOpen) closeDrawer(); }
  if (e.key === 'Enter' && e.target.matches('[data-coupon]')) { e.preventDefault(); e.target.parentElement.querySelector('[data-capply]').click(); }
});
$('#cartBtn').onclick = openDrawer; $('#mbarGo').onclick = openDrawer; $('#mbarOpen').onclick = openDrawer; $('#drX').onclick = closeDrawer; $('#scrim').onclick = closeDrawer;
$('#mdX').onclick = closeModal; $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
addEventListener('cart', () => { $('#cartN').textContent = cart.items().length; });
addEventListener('storage', (e) => { if (e.key && e.key.startsWith('advon-shop:')) draw(); });

/* ---------- category nav: highlight where you are ---------- */
function spy() {
  const links = $$('.cnav a'), secs = links.map(a => document.getElementById(a.dataset.nav)).filter(Boolean), w = $('.cnw');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(x => {
      if (!x.isIntersecting) return;
      links.forEach(a => a.classList.toggle('on', a.dataset.nav === x.target.id));
      const on = $('.cnav a.on'); if (on && w.scrollWidth > w.clientWidth) w.scrollTo({ left: on.offsetLeft - 16, behavior: 'smooth' });
    }), { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach(s => io.observe(s));
  }
  const hd = $('.hd'); addEventListener('scroll', () => hd.classList.toggle('sc', scrollY > 10), { passive: true });
}

/* ---------- start ---------- */
(async function start() {
  if (DEMO) $('#demobar').hidden = false;
  try { cat = await loadCatalog(); } catch (e) { cat = JSON.parse($('#seed').textContent); cat.pay = {}; toast('Δεν υπάρχει σύνδεση με το κατάστημα.'); }
  if (cat.settings && cat.settings.notice) { const n = $('#notice'); n.textContent = cat.settings.notice; n.hidden = false; }
  const known = cart.items().filter(i => P(i.id).id && P(i.id).active !== false && P(i.id).listed !== false);
  cart.save(ensureHosting(known));
  $('#g-clients').innerHTML = clientsBlock(cat);
  const hs = $('#istoselides .hstrip'); if (hs) hs.outerHTML = hostingStrip(cat);
  draw(); spy();
  if (location.hash === '#cart') openDrawer();
})();
