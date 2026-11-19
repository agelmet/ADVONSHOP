/* Advon Shop — the owner's panel.
   Changes are made on a working copy; nothing goes live until «Αποθήκευση».
   LIVE: talks to /api/admin (the passcode is checked on the server).
   DEMO (drafts): everything stays in this browser so you can play freely. */
import { DEMO, LS, demoCatalog, resetDemoCache, DEMO_CAT, demoOrders, saveDemoOrders } from './common.mjs';
import { euro, UNITS, unitPrice } from './pricing.mjs';
import { esc } from './render.mjs';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const TOKEN = 'advon-shop:admin-token';
const S = { cat: null, saved: '', pay: {}, orders: [], tab: 'orders', open: null, ofilter: 'all', q: '', undo: 0 };
const STATUS = { pending: 'Εκκρεμεί πληρωμή', awaiting_transfer: 'Αναμονή κατάθεσης', paid: 'Πληρώθηκε', done: 'Ολοκληρώθηκε', cancelled: 'Ακυρώθηκε', failed: 'Απέτυχε', refunded: 'Επιστροφή' };
const METHOD = { stripe: 'Κάρτα · Stripe', viva: 'Κάρτα/IRIS · Viva', bank: 'Κατάθεση', free: 'Χωρίς χρέωση' };

/* ---------- money in the inputs: «130» or «130,50» ↔ 13000 cents ---------- */
const toCents = v => { const s = String(v ?? '').trim().replace(/\s|€/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'); if (s === '') return null; const n = Math.round(parseFloat(s) * 100); return Number.isFinite(n) && n >= 0 ? n : NaN; };
const toInput = c => c == null ? '' : (c % 100 ? (c / 100).toFixed(2).replace('.', ',') : String(c / 100));
const slug = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[α-ω]/g, ch => ({ α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o' }[ch] || ''))
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 36) || 'proion';

function toast(msg, ms = 2400) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), ms); }

/* ---------- talking to the server (or the demo) ---------- */
async function api(action, data = {}) {
  if (DEMO) return demoApi(action, data);
  const r = await fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, token: LS.get(TOKEN, ''), ...data }) });
  const d = await r.json().catch(() => ({ ok: false, error: 'Δεν υπάρχει σύνδεση.' }));
  if (r.status === 401 && action !== 'login') { LS.del(TOKEN); showLogin(d.error); throw new Error(d.error); }
  return d;
}
async function demoApi(action, d) {
  const hist = LS.get('advon-shop:demo-history', []);
  switch (action) {
    case 'login': return { ok: true, token: 'demo' };
    case 'load': return { ok: true, catalog: await demoCatalog(), pay: { stripe: false, viva: false, bank: false }, undo: hist.length };
    case 'save': { hist.push(await demoCatalog()); LS.set('advon-shop:demo-history', hist.slice(-10)); const c = d.catalog; c.version = (c.version || 0) + 1; c.updatedAt = new Date().toISOString(); LS.set(DEMO_CAT, c); resetDemoCache(); return { ok: true, catalog: c }; }
    case 'undo': { const last = hist.pop(); if (!last) return { ok: false, error: 'Δεν υπάρχει προηγούμενη αποθήκευση.' }; LS.set('advon-shop:demo-history', hist); LS.set(DEMO_CAT, last); resetDemoCache(); return { ok: true, catalog: last }; }
    case 'orders': return { ok: true, orders: demoOrders() };
    case 'status': { const all = demoOrders(); const o = all.find(x => x.id === d.id); if (!o) return { ok: false, error: 'Δεν βρέθηκε.' }; o.status = d.status; if (d.status === 'paid') o.paidAt = new Date().toISOString(); o.history.push({ at: new Date().toISOString(), what: 'Κατάσταση: ' + STATUS[d.status] }); saveDemoOrders(all); return { ok: true, order: o }; }
    case 'note': { const all = demoOrders(); const o = all.find(x => x.id === d.id); if (o) o.ownerNote = d.note; saveDemoOrders(all); return { ok: true }; }
    case 'upload': return { ok: true, url: d.small || d.data };
    case 'keys': case 'setKeys': return { ok: false, error: 'Μόνο στο κανονικό κατάστημα.' };
  }
  return { ok: false, error: 'Άγνωστο' };
}

/* ---------- login ---------- */
function showLogin(msg = '') {
  document.body.classList.remove('adm');
  app.innerHTML = `<div class="login"><div class="ocard"><img src="assets/img/advon-mark-64.png" width="43" height="64" alt="" style="height:44px;width:auto;margin-bottom:14px">
   <h1 style="font-size:24px;margin-bottom:6px">Πίνακας διαχείρισης</h1>
   <p style="color:var(--muted);margin:0 0 14px">${DEMO ? 'Δοκιμαστική έκδοση: γράψτε οποιονδήποτε κωδικό. Ό,τι αλλάξετε μένει μόνο σε αυτόν τον browser.' : 'Γράψτε τον κωδικό σας.'}</p>
   <form id="lf"><label class="field"><span>Κωδικός</span><input type="password" id="pw" autocomplete="current-password" required></label>
   <div class="err" id="le">${esc(msg)}</div><button class="btn primary lg block" type="submit">Είσοδος</button></form></div></div>`;
  $('#pw').focus();
  $('#lf').onsubmit = async e => {
    e.preventDefault(); const b = e.submitter; b.disabled = true;
    const r = await api('login', { pass: $('#pw').value });
    if (r.ok) { LS.set(TOKEN, r.token); start(); } else { $('#le').textContent = r.error || 'Λάθος κωδικός.'; b.disabled = false; }
  };
}

/* ---------- shell ---------- */
async function start() {
  document.body.classList.add('adm');
  app.innerHTML = `<p style="padding:40px;text-align:center;color:var(--muted)">Φορτώνει…</p>`;
  const r = await api('load'); if (!r.ok) return showLogin(r.error);
  setCat(r.catalog); S.pay = r.pay || {}; S.undo = r.undo || 0;
  const o = await api('orders'); S.orders = o.ok ? o.orders : [];
  shell(); draw();
}
function setCat(c) { S.cat = JSON.parse(JSON.stringify(c)); S.saved = JSON.stringify(c); }
const dirty = () => JSON.stringify(S.cat) !== S.saved;
function markDirty() { $('#savebar').classList.toggle('on', dirty()); }

function shell() {
  const waiting = S.orders.filter(o => o.status === 'awaiting_transfer' || o.status === 'paid').length;
  app.innerHTML = `
  ${DEMO ? '<div class="demobar"><b>Δοκιμαστική έκδοση</b> — οι αλλαγές μένουν σε αυτόν τον browser και φαίνονται στο <a href="index.html" target="_blank">κατάστημα</a>.</div>' : ''}
  <div class="top"><div class="wrap"><a class="brand" href="index.html" target="_blank"><img src="assets/img/advon-mark-64.png" width="43" height="64" alt="">Διαχείριση</a>
   <div class="sp"><a class="btn ghost sm" href="index.html" target="_blank" aria-label="Το κατάστημα"><span class="hide-sm">Το κατάστημα&nbsp;</span>↗</a><button class="btn ghost sm" id="logout">Έξοδος</button></div></div>
   <div class="wrap tabs" role="tablist">
    <button data-tab="orders">Παραγγελίες${waiting ? `<span class="cnt">${waiting}</span>` : ''}</button><button data-tab="products">Προϊόντα & τιμές</button><button data-tab="disc">Εκπτώσεις</button><button data-tab="settings">Ρυθμίσεις</button></div></div>
  <div class="wrap pane" id="pane"></div>
  <div class="savebar" id="savebar"><span>Έχετε αλλαγές που δεν αποθηκεύτηκαν</span><button class="btn ghost sm" id="discard">Ακύρωση</button><button class="btn primary sm" id="save">Αποθήκευση</button></div>
  <div class="scrim" id="scrim"></div><div class="dlg modal" id="dlg" role="dialog" aria-modal="true"><div class="dh"><h2 id="dlgT"></h2><button class="x" id="dlgX" aria-label="Κλείσιμο">×</button></div><div class="db" id="dlgB"></div><div class="df" id="dlgF"></div></div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  $('#logout').onclick = async () => { if (dirty() && !(await ask('Έξοδος', 'Έχετε αλλαγές που δεν αποθηκεύτηκαν. Να φύγετε χωρίς αποθήκευση;', 'Έξοδος χωρίς αποθήκευση', true))) return; LS.del(TOKEN); showLogin(); };
  $('#save').onclick = save;
  $('#discard').onclick = () => { S.cat = JSON.parse(S.saved); S.open = null; draw(); markDirty(); toast('Οι αλλαγές ακυρώθηκαν'); };
  $('#scrim').onclick = closeDlg; $('#dlgX').onclick = closeDlg;
  $$('.tabs button').forEach(b => b.onclick = () => { S.tab = b.dataset.tab; S.open = null; draw(); scrollTo({ top: 0 }); });
}
addEventListener('beforeunload', e => { if (S.cat && dirty()) { e.preventDefault(); e.returnValue = ''; } });

async function save() {
  const b = $('#save'); b.disabled = true; b.textContent = 'Αποθηκεύεται…';
  const bad = S.cat.products.find(p => !Number.isFinite(p.price) || (p.variants || []).some(v => !Number.isFinite(v.price)));
  if (bad) { toast('Ελέγξτε την τιμή στο «' + bad.name + '»'); b.disabled = false; b.textContent = 'Αποθήκευση'; return; }
  const r = await api('save', { catalog: S.cat, baseVersion: JSON.parse(S.saved).version ?? null });
  b.disabled = false; b.textContent = 'Αποθήκευση';
  if (!r.ok) { toast(r.error || 'Δεν αποθηκεύτηκε', 5000); return; }
  setCat(r.catalog); S.undo++; markDirty(); draw(); toast('Αποθηκεύτηκε ✓ — το κατάστημα ενημερώθηκε');
}

function draw() {
  $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === S.tab));
  ({ orders: drawOrders, products: drawProducts, disc: drawDisc, settings: drawSettings })[S.tab]();
  markDirty();
}

/* ---------- modal helpers (no browser pop-ups) ---------- */
function openDlg(title, body, foot = '') { $('#dlgT').textContent = title; $('#dlgB').innerHTML = body; $('#dlgF').innerHTML = foot; $('#dlg').classList.add('on'); $('#scrim').classList.add('on'); }
function closeDlg() { $('#dlg').classList.remove('on'); $('#scrim').classList.remove('on'); }
function ask(title, text, okLabel = 'Ναι', danger = false) {
  return new Promise(res => {
    openDlg(title, `<p style="margin:0">${text}</p>`, `<div class="acts" style="margin:0;justify-content:flex-end"><button class="btn ghost" id="aNo">Όχι</button><button class="btn ${danger ? 'dark' : 'primary'}" id="aOk">${esc(okLabel)}</button></div>`);
    $('#aNo').onclick = () => { closeDlg(); res(false); }; $('#aOk').onclick = () => { closeDlg(); res(true); };
  });
}

/* ================= ORDERS ================= */
const dt = s => s ? new Date(s).toLocaleString('el-GR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
function drawOrders() {
  const O = S.orders, now = new Date(), ym = now.toISOString().slice(0, 7), today = now.toISOString().slice(0, 10);
  const paid = O.filter(o => o.status === 'paid' || o.status === 'done');
  const sum = arr => arr.reduce((a, o) => a + o.priced.total, 0);
  const f = S.ofilter;
  const list = O.filter(o => f === 'all' || (f === 'paid' ? o.status === 'paid' : f === 'open' ? o.status === 'pending' : o.status === f));
  const chip = (k, l) => `<button class="chip${f === k ? ' on' : ''}" data-of="${k}">${l}<span style="opacity:.55;margin-left:6px">${k === 'all' ? O.length : O.filter(o => k === 'open' ? o.status === 'pending' : o.status === k).length}</span></button>`;
  $('#pane').innerHTML = `<h2>Παραγγελίες</h2><p class="hint">Κάθε πληρωμένη παραγγελία σας έρχεται και με e-mail. Πατήστε μια παραγγελία για λεπτομέρειες.</p>
   <div class="stats"><div class="stat"><small>Σήμερα</small><b>${euro(sum(paid.filter(o => (o.paidAt || o.createdAt).slice(0, 10) === today)))}</b></div>
   <div class="stat"><small>Αυτόν τον μήνα</small><b>${euro(sum(paid.filter(o => (o.paidAt || o.createdAt).slice(0, 7) === ym)))}</b></div>
   <div class="stat"><small>Περιμένουν κατάθεση</small><b>${O.filter(o => o.status === 'awaiting_transfer').length}</b></div></div>
   <div class="fchips">${chip('all', 'Όλες')}${chip('paid', 'Πληρωμένες')}${chip('awaiting_transfer', 'Κατάθεση')}${chip('open', 'Εκκρεμείς')}${chip('done', 'Ολοκληρωμένες')}${chip('cancelled', 'Ακυρωμένες')}</div>
   <div class="toolbar"><button class="btn ghost sm" id="reloadO">↻ Ανανέωση</button><button class="btn ghost sm" id="csvO">Λίστα για τον λογιστή (Excel)</button></div>
   <div class="ocards">${list.map(o => `<button class="ocardx" data-oid="${esc(o.id)}"><div><div class="who">${esc(o.customer.name)}</div><div class="meta">${esc(o.id)} · ${dt(o.createdAt)} · ${esc(METHOD[o.method] || o.method)}</div>
     <div class="meta" style="margin-top:4px">${esc(o.priced.lines.map(l => (l.qty > 1 ? l.qty + '× ' : '') + l.name).join(', '))}</div></div>
     <div><div class="sum">${euro(o.priced.total, { always2: true })}</div><div style="margin-top:6px;text-align:right"><span class="st ${o.flag ? 'flag' : o.status}">${o.flag ? 'Έλεγχος ποσού!' : STATUS[o.status] || o.status}</span></div></div></button>`).join('') || '<div class="empty"><b>Καμία παραγγελία ακόμα</b>Μόλις κάποιος αγοράσει, θα εμφανιστεί εδώ.</div>'}</div>`;
  $$('[data-of]').forEach(b => b.onclick = () => { S.ofilter = b.dataset.of; drawOrders(); });
  $$('[data-oid]').forEach(b => b.onclick = () => orderDlg(b.dataset.oid));
  $('#reloadO').onclick = async () => { const o = await api('orders'); if (o.ok) { S.orders = o.orders; drawOrders(); toast('Ενημερώθηκε'); } };
  $('#csvO').onclick = () => {
    const rows = [['Παραγγελία', 'Ημερομηνία', 'Κατάσταση', 'Τρόπος', 'Πελάτης', 'E-mail', 'Τηλέφωνο', 'Τιμολόγιο', 'Επωνυμία', 'ΑΦΜ', 'ΔΟΥ', 'Διεύθυνση', 'Καθαρή αξία', 'ΦΠΑ', 'Σύνολο', 'Προϊόντα']];
    for (const o of S.orders) { const c = o.customer, p = o.priced; rows.push([o.id, dt(o.createdAt), STATUS[o.status], METHOD[o.method], c.name, c.email, c.phone, c.invoice ? 'ΝΑΙ' : 'ΟΧΙ', c.company, c.afm, c.doy, c.address, (p.net / 100).toFixed(2).replace('.', ','), (p.vat / 100).toFixed(2).replace('.', ','), (p.total / 100).toFixed(2).replace('.', ','), p.lines.map(l => l.qty + '× ' + l.name + (l.vname ? ' (' + l.vname + ')' : '')).join(' | ')]); }
    download('paraggelies-' + new Date().toISOString().slice(0, 10) + '.csv', rows);
  };
}

function orderDlg(id) {
  const o = S.orders.find(x => x.id === id); if (!o) return;
  const c = o.customer, p = o.priced;
  const inv = c.invoice ? `${c.company}\nΑΦΜ: ${c.afm}\nΔΟΥ: ${c.doy}\n${c.address}` : '';
  const btn = (st, l, cls = 'ghost') => o.status === st ? '' : `<button class="btn ${cls} sm" data-st="${st}">${l}</button>`;
  openDlg('Παραγγελία ' + o.id, `
   ${o.flag ? '<div class="err">Το ποσό που πληρώθηκε δεν ταιριάζει με την παραγγελία. Ελέγξτε στη Stripe/Viva πριν προχωρήσετε.</div>' : ''}
   <p><span class="st ${o.status}">${STATUS[o.status] || o.status}</span> · ${esc(METHOD[o.method] || o.method)} · ${dt(o.createdAt)}</p>
   <div class="kv"><span>Πελάτης</span><b>${esc(c.name)}</b><span>E-mail</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a><span>Τηλέφωνο</span><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>${c.notes ? `<span>Σημείωση</span><span style="color:var(--ink)">${esc(c.notes)}</span>` : ''}</div>
   ${c.invoice ? `<div class="sub"><b>Τιμολόγιο</b><div style="white-space:pre-line">${esc(inv)}</div><button class="btn ghost sm" id="cpInv" style="margin-top:8px">Αντιγραφή στοιχείων</button></div>` : '<p style="color:var(--muted);font-size:14px">Ζήτησε απόδειξη.</p>'}
   ${p.lines.map(l => `<div class="line"><div><div class="nm">${l.qty > 1 ? l.qty + ' × ' : ''}${esc(l.name)}</div>${l.vname ? `<div class="vn">${esc(l.vname)}</div>` : ''}${l.note ? `<div class="nt">«${esc(l.note)}»</div>` : ''}</div><div class="amt">${euro(l.gross, { always2: true })}</div></div>`).join('')}
   <div class="totals" style="margin-top:10px">${p.discount ? `<div class="disc"><span>Μέσα στις τιμές: κουπόνι ${esc(p.coupon && p.coupon.code)}</span><span>−${euro(p.discount, { always2: true })}</span></div>` : ''}<div><span>Καθαρή αξία</span><span>${euro(p.net, { always2: true })}</span></div><div><span>ΦΠΑ</span><span>${euro(p.vat, { always2: true })}</span></div><div class="big"><span>Σύνολο</span><span>${euro(p.total, { always2: true })}</span></div></div>
   <label class="field"><span>Δική σας σημείωση (τη βλέπετε μόνο εσείς)</span><textarea id="oNote">${esc(o.ownerNote || '')}</textarea></label>
   <div class="hist">${(o.history || []).map(h => `<div>${dt(h.at)} — ${esc(h.what)}</div>`).join('')}</div>`,
   `<div class="acts" style="margin:0">${o.status === 'awaiting_transfer' || o.status === 'pending' ? btn('paid', 'Ήρθαν τα χρήματα ✓', 'primary') : ''}${btn('done', 'Ολοκληρώθηκε')}${btn('cancelled', 'Ακύρωση')}${o.status === 'paid' || o.status === 'done' ? btn('refunded', 'Έγινε επιστροφή χρημάτων') : ''}<button class="btn ghost sm" id="saveNote">Αποθήκευση σημείωσης</button></div>`);
  const ci = $('#cpInv'); if (ci) ci.onclick = () => navigator.clipboard.writeText(inv).then(() => toast('Αντιγράφηκε'));
  $('#saveNote').onclick = async () => { await api('note', { id, note: $('#oNote').value }); o.ownerNote = $('#oNote').value; toast('Αποθηκεύτηκε'); };
  $$('[data-st]').forEach(b => b.onclick = async () => {
    const st = b.dataset.st;
    const msg = { paid: 'Βεβαιωθήκατε ότι τα χρήματα είναι στον λογαριασμό σας;', cancelled: 'Να ακυρωθεί η παραγγελία;', refunded: 'Η επιστροφή γίνεται από τη Stripe ή τη Viva (ή με κατάθεση). Εδώ απλώς τη σημειώνουμε. Συνέχεια;', done: 'Να σημειωθεί ως ολοκληρωμένη;' }[st];
    if (!(await ask('Επιβεβαίωση', msg, 'Ναι'))) { orderDlg(id); return; }
    const r = await api('status', { id, status: st });
    if (r.ok) { Object.assign(o, r.order); toast('Ενημερώθηκε'); drawOrders(); orderDlg(id); } else toast(r.error);
  });
}

function download(name, rows) {
  const csv = '﻿' + rows.map(r => r.map(v => { v = String(v ?? ''); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(';')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ================= PRODUCTS ================= */
const cats = () => [...S.cat.categories].sort((a, b) => a.order - b.order);
const prods = () => [...S.cat.products].sort((a, b) => a.order - b.order);
const P = id => S.cat.products.find(p => p.id === id);

function priceLabel(p) {
  const up = p.variants && p.variants.length ? p.variants.map(v => unitPrice(S.cat, p, v.id)).filter(Boolean).sort((a, b) => a.price - b.price)[0] : unitPrice(S.cat, p, null);
  if (!up || !Number.isFinite(up.price)) return '—';
  return (p.variants && p.variants.length > 1 ? 'από ' : '') + (up.original > up.price ? `<s>${euro(up.original)}</s> ` : '') + euro(up.price) + ' ' + ((UNITS[p.unit] || {}).el || '') + (up.reason ? ` · <b style="color:var(--red)">${esc(up.reason)}</b>` : '');
}

function drawProducts() {
  const q = S.q.toLowerCase();
  const match = p => !q || [p.name, p.sku, p.short].join(' ').toLowerCase().includes(q);
  $('#pane').innerHTML = `<h2>Προϊόντα & τιμές</h2><p class="hint">Πατήστε ένα προϊόν για να το αλλάξετε. Σύρετε από τις τελίτσες ⋮⋮ για να αλλάξετε τη σειρά. Ο διακόπτης το εμφανίζει ή το κρύβει από το κατάστημα.</p>
   <div class="toolbar"><label class="search"><span class="sr">Αναζήτηση</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="pq" type="search" placeholder="Αναζήτηση προϊόντος" value="${esc(S.q)}"></label>
   <button class="btn primary sm" id="newP">+ Νέο προϊόν</button><button class="btn ghost sm" id="catsB">Κατηγορίες</button><button class="btn ghost sm" id="bulkB">Μαζικές αλλαγές & Excel</button></div>
   ${cats().map(c => { const ps = prods().filter(p => p.cat === c.id && match(p)); return `<div class="pcat"><h3>${esc(c.name)} · ${ps.length}</h3><div class="plist" data-cat="${esc(c.id)}">${ps.map(rowHtml).join('') || '<p style="color:var(--muted);font-size:14px;margin:0">Κανένα προϊόν εδώ.</p>'}</div></div>`; }).join('')}`;
  $('#pq').oninput = e => { S.q = e.target.value; const pos = e.target.selectionStart; drawProducts(); const n = $('#pq'); n.focus(); n.setSelectionRange(pos, pos); };
  $('#newP').onclick = newProduct; $('#catsB').onclick = catsDlg; $('#bulkB').onclick = bulkDlg;
  $$('.plist').forEach(l => enableDrag(l));
  if (S.open) bindEditor(S.open);
}

function rowHtml(p) {
  const open = S.open === p.id;
  return `<div class="prow${open ? ' open' : ''}" data-pid="${esc(p.id)}"><div class="phead">
   <span class="handle" aria-label="Σύρετε για αλλαγή σειράς" title="Σύρετε"><svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor"><circle cx="4" cy="4" r="1.7"/><circle cx="10" cy="4" r="1.7"/><circle cx="4" cy="10" r="1.7"/><circle cx="10" cy="10" r="1.7"/><circle cx="4" cy="16" r="1.7"/><circle cx="10" cy="16" r="1.7"/></svg></span>
   <span class="thumb">${p.img ? `<img src="${esc(p.img)}" alt="">` : esc((p.name || '?').slice(0, 1))}</span>
   <div class="pinfo" data-toggle="${esc(p.id)}"><b>${esc(p.name)}${p.example ? '<span class="ex">προτεινόμενη τιμή</span>' : ''}</b><span>${priceLabel(p)}${Number.isFinite(p.stock) ? ' · απόθεμα ' + p.stock : ''}</span></div>
   <label class="sw" title="Εμφανίζεται στο κατάστημα"><input type="checkbox" data-active="${esc(p.id)}" ${p.active !== false ? 'checked' : ''} aria-label="Εμφανίζεται στο κατάστημα"><i></i></label></div>
   ${open ? editorHtml(p) : ''}</div>`;
}

function rulesNote(p) {
  const nm = id => ((S.cat.products || []).find(x => x.id === id) || {}).name || id;
  const r = [];
  if (p.kind === 'build') r.push('Είναι «τι θα φτιάξουμε» (βήμα 1).');
  if (p.kind === 'hosting') r.push('Είναι φιλοξενία (βήμα 2) — μπαίνει μόνο μαζί με ιστοσελίδα.');
  if (p.requires && p.requires.length) r.push('Μπαίνει πάντα μαζί με: ' + p.requires.map(nm).join(' ή ') + '.');
  (p.variants || []).forEach(v => { if (v.requires && v.requires.length) r.push('Η επιλογή «' + v.name + '» μπαίνει μαζί με: ' + v.requires.map(nm).join(' ή ') + '.'); });
  if (p.needsSite) r.push('Ζητάει ιστοσελίδα (νέα ή τη διεύθυνση της υπάρχουσας).');
  if (p.listed === false) r.push('Δεν φαίνεται στο κατάστημα — πωλείται από τη σελίδα «Ανανέωση».');
  return r.length ? `<div class="rules">${r.map(x => `<div>• ${esc(x)}</div>`).join('')}</div>` : '';
}
function editorHtml(p) {
  const unitOpts = Object.entries(UNITS).map(([k, u]) => `<option value="${k}" ${p.unit === k ? 'selected' : ''}>${k === 'piece' ? 'τεμάχιο' : u.el.replace('/ ', 'ανά ')}</option>`).join('');
  const s = p.sale || {};
  return `<div class="ped">
   <label class="field"><span>Όνομα</span><input data-f="name" value="${esc(p.name)}"></label>
   <label class="field"><span>Σύντομη περιγραφή</span><input data-f="short" value="${esc(p.short || '')}"><small>Φαίνεται στην κάρτα του προϊόντος.</small></label>
   <label class="field"><span>Περιγραφή</span><textarea data-f="desc" rows="6">${esc(p.desc || '')}</textarea><small>Κάθε γραμμή που ξεκινά με • γίνεται κουκκίδα με ✓.</small></label>
   <div class="grid3">
    <label class="field"><span>Κατηγορία</span><select data-f="cat">${cats().map(c => `<option value="${esc(c.id)}" ${c.id === p.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
    ${p.variants && p.variants.length ? `<div class="field"><span>Τιμή</span><div class="vnote">Αλλάζει στις <b>Επιλογές</b> παρακάτω ↓</div></div>` : `<label class="field"><span>Τιμή ${S.cat.settings.pricesIncludeVat ? '(με ΦΠΑ)' : '(χωρίς ΦΠΑ)'}</span><div class="money"><input data-money="price" inputmode="decimal" value="${toInput(p.price)}"></div></label>`}
    <label class="field"><span>Χρέωση</span><select data-f="unit">${unitOpts}</select></label>
    <label class="field"><span>ΦΠΑ</span><select data-f="vat" data-num>${[24, 13, 6, 0].map(v => `<option ${p.vat === v ? 'selected' : ''} value="${v}">${v}%</option>`).join('')}</select></label>
    <label class="field"><span>Μέγιστη ποσότητα</span><input data-f="maxQty" data-num inputmode="numeric" value="${p.maxQty || 1}"></label>
    <label class="field"><span>Απόθεμα</span><input data-f="stock" data-num inputmode="numeric" value="${Number.isFinite(p.stock) ? p.stock : ''}" placeholder="απεριόριστο"></label>
   </div>
   ${rulesNote(p)}
   <label class="field"><span>Σημείωση κάτω από την τιμή (προαιρετικά)</span><input data-f="priceNote" value="${esc(p.priceNote || '')}" placeholder="π.χ. χρεώνεται ο 1ος μήνας · χωρίς δέσμευση"></label>
   <div class="grid2"><label class="field"><span>Ετικέτα (π.χ. «Νέο»)</span><input data-f="badge" value="${esc(p.badge || '')}"></label>
    <label class="field"><span>Κωδικός (για Excel)</span><input data-f="sku" value="${esc(p.sku || '')}"></label></div>
   <div class="togrow"><div>Προβεβλημένο<small>Κάρτα με χρωματιστό περίγραμμα</small></div><label class="sw"><input type="checkbox" data-f="featured" ${p.featured ? 'checked' : ''}><i></i></label></div>
   <div class="sub"><b>Επιλογές (π.χ. μεγέθη, πακέτα)</b>
    <div id="vlist">${(p.variants || []).map((v, i) => `<div class="vrow" data-vi="${i}"><span class="handle vh"><svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor"><circle cx="4" cy="6" r="1.6"/><circle cx="10" cy="6" r="1.6"/><circle cx="4" cy="14" r="1.6"/><circle cx="10" cy="14" r="1.6"/></svg></span><input data-v="name" value="${esc(v.name)}" aria-label="Όνομα επιλογής"><div class="money"><input data-v="price" inputmode="decimal" value="${toInput(v.price)}" aria-label="Τιμή"></div><button class="icon" data-vdel="${i}" aria-label="Διαγραφή επιλογής">×</button></div>`).join('')}</div>
    <button class="btn ghost sm" id="vadd">+ Επιλογή</button></div>
   <div class="sub"><b>Προσφορά</b><div class="grid3">
    <label class="field"><span>Έκπτωση %</span><input data-sale="pct" inputmode="numeric" value="${s.pct || ''}" placeholder="π.χ. 20"></label>
    <label class="field"><span>ή νέα τιμή</span><div class="money"><input data-sale="price" inputmode="decimal" value="${toInput(s.price)}" ${p.variants && p.variants.length ? 'disabled placeholder="μόνο %"' : ''}></div></label>
    <label class="field"><span>Ετικέτα</span><input data-sale="label" value="${esc(s.label || '')}" placeholder="Προσφορά"></label>
    <label class="field"><span>Από</span><input type="date" data-sale="from" value="${s.from || ''}"></label>
    <label class="field"><span>Έως</span><input type="date" data-sale="to" value="${s.to || ''}"></label>
    <div class="field"><span>&nbsp;</span>${p.sale ? '<button class="btn ghost sm" id="saleOff">Χωρίς προσφορά</button>' : ''}</div></div>
    <small style="color:var(--muted)">Χωρίς ημερομηνίες ισχύει από τώρα, μέχρι να τη σβήσετε.</small></div>
   <div class="sub"><b>Ερώτηση στον πελάτη</b><label class="field"><span>Τι να συμπληρώσει (προαιρετικά)</span><input data-f="ask" value="${esc(p.ask || '')}" placeholder="π.χ. Ποια ιστοσελίδα; (domain)"></label>
    <div class="togrow"><div>Υποχρεωτικό</div><label class="sw"><input type="checkbox" data-f="askRequired" ${p.askRequired ? 'checked' : ''}><i></i></label></div></div>
   <div class="sub"><b>Φωτογραφία</b><div class="imgbox">${p.img ? `<img src="${esc(p.img)}" alt="">` : '<span style="color:var(--muted);font-size:14px">Χωρίς φωτογραφία</span>'}
    <label class="btn ghost sm">${p.img ? 'Αλλαγή' : 'Ανέβασμα'}<input type="file" accept="image/*" id="imgIn" hidden></label>${p.img ? '<button class="btn ghost sm" id="imgDel">Αφαίρεση</button>' : ''}</div></div>
   ${p.example ? '<div class="togrow"><div>Προτεινόμενη τιμή<small>Το σήμα φεύγει μόλις επιβεβαιώσετε την τιμή</small></div><button class="btn ghost sm" id="okPrice">Η τιμή είναι σωστή ✓</button></div>' : ''}
   <div class="acts"><button class="btn ghost sm" id="closeP">Κλείσιμο</button><button class="btn ghost sm" id="dupP">Διπλότυπο</button><a class="btn ghost sm" href="index.html#p-${esc(p.id)}" target="_blank">Προβολή ↗</a><button class="btn ghost sm red" id="delP">Διαγραφή</button></div></div>`;
}

function bindEditor(id) {
  const row = $(`.prow[data-pid="${CSS.escape(id)}"]`); if (!row) return;
  const p = P(id);
  const set = () => { const info = $('.pinfo span', row); if (info) info.innerHTML = priceLabel(p); markDirty(); };
  $$('[data-f]', row).forEach(el => el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => {
    const f = el.dataset.f;
    if (el.type === 'checkbox') p[f] = el.checked;
    else if ('num' in el.dataset) { const n = el.value.trim() === '' ? null : Math.max(0, Math.round(Number(el.value))); p[f] = f === 'stock' ? n : (n ?? 1); }
    else p[f] = el.value;
    if (f === 'name') $('.pinfo b', row).firstChild.textContent = el.value;
    if (f === 'cat') { drawProducts(); return; }
    set();
  }));
  const pr = $('[data-money="price"]', row);
  if (pr) pr.addEventListener('input', () => { const c = toCents(pr.value); pr.style.borderColor = Number.isFinite(c) ? '' : 'var(--red)'; p.price = Number.isFinite(c) ? c : NaN; set(); });
  $$('.vrow', row).forEach(vr => {
    const v = p.variants[vr.dataset.vi];
    $('[data-v="name"]', vr).oninput = e => { v.name = e.target.value; set(); };
    const vp = $('[data-v="price"]', vr); vp.oninput = () => { const c = toCents(vp.value); vp.style.borderColor = Number.isFinite(c) ? '' : 'var(--red)'; v.price = Number.isFinite(c) ? c : NaN; set(); };
  });
  $$('[data-vdel]', row).forEach(b => b.onclick = () => { p.variants.splice(Number(b.dataset.vdel), 1); drawProducts(); markDirty(); });
  $('#vadd').onclick = () => { (p.variants = p.variants || []).push({ id: 'v' + Date.now().toString(36), name: 'Νέα επιλογή', price: p.variants.length ? p.variants[p.variants.length - 1].price : p.price }); drawProducts(); markDirty(); };
  const vl = $('#vlist'); if (vl) enableDrag(vl, '.vrow', '.vh', order => { p.variants = order.map(i => p.variants[i]); drawProducts(); markDirty(); });
  $$('[data-sale]', row).forEach(el => el.addEventListener('input', () => {
    const k = el.dataset.sale; p.sale = p.sale || { active: true };
    if (k === 'pct') { p.sale.pct = el.value ? Math.max(1, Math.min(95, Math.round(Number(el.value)))) : null; if (p.sale.pct) p.sale.price = null; }
    else if (k === 'price') { const c = toCents(el.value); p.sale.price = Number.isFinite(c) ? c : null; if (p.sale.price != null) p.sale.pct = null; }
    else p.sale[k] = el.value || null;
    if (!p.sale.pct && p.sale.price == null) p.sale = null;
    set();
  }));
  const so = $('#saleOff'); if (so) so.onclick = () => { p.sale = null; drawProducts(); markDirty(); };
  const ok = $('#okPrice'); if (ok) ok.onclick = () => { p.example = false; drawProducts(); markDirty(); };
  $('#closeP').onclick = () => { S.open = null; drawProducts(); };
  $('#dupP').onclick = () => { const c = JSON.parse(JSON.stringify(p)); c.id = uniqueId(p.id + '-2'); c.sku = (p.sku || '') + '-2'; c.name = p.name + ' (αντίγραφο)'; c.order = p.order + .5; S.cat.products.push(c); renumber(); S.open = c.id; drawProducts(); markDirty(); };
  $('#delP').onclick = async () => { if (await ask('Διαγραφή', `Να διαγραφεί το «${esc(p.name)}»; Αν θέλετε απλώς να μη φαίνεται, κλείστε τον διακόπτη του.`, 'Διαγραφή', true)) { S.cat.products = S.cat.products.filter(x => x.id !== id); S.open = null; drawProducts(); markDirty(); } };
  $('#imgIn').onchange = async e => {
    const f = e.target.files[0]; if (!f) return; toast('Ανεβαίνει…', 8000);
    try {
      const data = await shrink(f, 1200, .82), small = DEMO ? await shrink(f, 500, .7) : undefined;
      const r = await api('upload', { name: p.name, data, small });
      if (r.ok) { p.img = r.url; drawProducts(); markDirty(); toast('Η φωτογραφία μπήκε — πατήστε Αποθήκευση'); } else toast(r.error);
    } catch (err) { toast('Δεν ανέβηκε η φωτογραφία'); }
  };
  const idel = $('#imgDel'); if (idel) idel.onclick = () => { p.img = null; drawProducts(); markDirty(); };
}

/* photos are made smaller in the browser before they are sent (fast pages, small storage) */
function shrink(file, max, q) {
  return new Promise((res, rej) => {
    const img = new Image(); img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      let d = c.toDataURL('image/webp', q); if (!d.startsWith('data:image/webp')) d = c.toDataURL('image/jpeg', q); res(d); URL.revokeObjectURL(img.src);
    }; img.onerror = rej; img.src = URL.createObjectURL(file);
  });
}

const uniqueId = base => { let id = slug(base), i = 2; while (P(id)) id = slug(base) + '-' + i++; return id; };
function renumber() { prods().forEach((p, i) => p.order = i); }
function newProduct() {
  const c = cats()[0];
  const p = { id: uniqueId('neo-proion'), sku: 'NEW-' + Date.now().toString(36).toUpperCase().slice(-4), cat: c.id, name: 'Νέο προϊόν', short: '', desc: '', price: 0, unit: 'once', vat: S.cat.vatDefault || 24, maxQty: 1, stock: null, variants: [], sale: null, badge: null, featured: false, active: false, img: null, ask: null, askRequired: false, order: -1 };
  S.cat.products.push(p); renumber(); S.open = p.id; S.q = ''; drawProducts(); markDirty();
  toast('Νέο προϊόν — είναι κρυφό μέχρι να ανοίξετε τον διακόπτη');
  setTimeout(() => { const n = $(`.prow[data-pid="${p.id}"] [data-f="name"]`); n && (n.focus(), n.select()); }, 60);
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-toggle]'); if (t && S.tab === 'products') { S.open = S.open === t.dataset.toggle ? null : t.dataset.toggle; drawProducts(); const r = $(`.prow[data-pid="${CSS.escape(t.dataset.toggle)}"]`); r && S.open && r.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
});
document.addEventListener('change', e => { const a = e.target.closest('[data-active]'); if (a) { P(a.dataset.active).active = a.checked; markDirty(); toast(a.checked ? 'Θα εμφανίζεται στο κατάστημα' : 'Θα κρυφτεί από το κατάστημα'); } });

/* drag to reorder (mouse and finger) */
function enableDrag(list, itemSel = '.prow', handleSel = '.phead > .handle', onDone) {
  list.addEventListener('pointerdown', e => {
    const h = e.target.closest(handleSel); if (!h || !list.contains(h)) return;
    const item = h.closest(itemSel); if (!item || item.parentElement !== list) return;
    e.preventDefault(); h.setPointerCapture(e.pointerId);
    const ph = document.createElement('div'); ph.className = 'ph'; ph.style.height = item.offsetHeight + 'px';
    const r = item.getBoundingClientRect(), dy = e.clientY - r.top;
    item.classList.add('dragging'); item.style.width = r.width + 'px'; item.style.position = 'fixed'; item.style.left = r.left + 'px'; item.style.top = r.top + 'px'; item.style.pointerEvents = 'none';
    list.insertBefore(ph, item.nextSibling);
    const move = ev => {
      item.style.top = (ev.clientY - dy) + 'px';
      const sibs = [...list.children].filter(x => x !== item && x !== ph && x.matches(itemSel));
      const after = sibs.find(x => { const b = x.getBoundingClientRect(); return ev.clientY < b.top + b.height / 2; });
      list.insertBefore(ph, after || null);
      if (ev.clientY < 70) scrollBy(0, -12); if (ev.clientY > innerHeight - 70) scrollBy(0, 12);
    };
    const up = () => {
      h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up);
      list.insertBefore(item, ph); ph.remove(); item.classList.remove('dragging'); item.removeAttribute('style');
      if (onDone) { onDone([...list.querySelectorAll(itemSel)].map(x => Number(x.dataset.vi))); return; }
      const ids = [...list.querySelectorAll(itemSel)].map(x => x.dataset.pid);
      const base = Math.min(...ids.map(id => P(id).order));
      ids.forEach((id, i) => P(id).order = base + i / 1000);
      renumber(); markDirty();
    };
    h.addEventListener('pointermove', move); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
  });
}

function catsDlg() {
  const draw = () => {
    $('#dlgB').innerHTML = `<p class="hint" style="margin:0 0 12px">Σύρετε για σειρά, γράψτε για μετονομασία.</p><div class="plist" id="clist">${cats().map(c => `<div class="prow" data-cid="${esc(c.id)}"><div class="phead"><span class="handle ch"><svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor"><circle cx="4" cy="6" r="1.6"/><circle cx="10" cy="6" r="1.6"/><circle cx="4" cy="14" r="1.6"/><circle cx="10" cy="14" r="1.6"/></svg></span>
      <div style="flex:1;display:grid;gap:6px"><input data-cn value="${esc(c.name)}" style="min-height:42px;border:1px solid #D5DDEA;border-radius:10px;padding:6px 12px"><input data-cd value="${esc(c.desc || '')}" placeholder="Μικρή περιγραφή" style="min-height:38px;border:1px solid #E4E9F2;border-radius:10px;padding:6px 12px;font-size:14px"></div>
      <button class="icon" data-cdel aria-label="Διαγραφή">×</button></div></div>`).join('')}</div>`;
    $$('[data-cid]').forEach(r => {
      const c = S.cat.categories.find(x => x.id === r.dataset.cid);
      $('[data-cn]', r).oninput = e => { c.name = e.target.value; markDirty(); };
      $('[data-cd]', r).oninput = e => { c.desc = e.target.value; markDirty(); };
      $('[data-cdel]', r).onclick = () => { if (S.cat.products.some(p => p.cat === c.id)) { toast('Η κατηγορία έχει προϊόντα — μετακινήστε τα πρώτα'); return; } S.cat.categories = S.cat.categories.filter(x => x !== c); draw(); markDirty(); };
    });
    const cl = $('#clist'); cl.querySelectorAll('[data-cid]').forEach((x, i) => x.dataset.vi = i);
    enableDrag(cl, '.prow', '.ch', order => { const list = cats(); order.forEach((i, k) => list[i].order = k); draw(); markDirty(); });
  };
  openDlg('Κατηγορίες', '', `<div class="acts" style="margin:0"><button class="btn ghost sm" id="cadd">+ Νέα κατηγορία</button><button class="btn primary sm" id="cok">Έτοιμο</button></div>`);
  draw();
  $('#cadd').onclick = () => { S.cat.categories.push({ id: 'cat-' + Date.now().toString(36), name: 'Νέα κατηγορία', desc: '', order: S.cat.categories.length }); draw(); markDirty(); };
  $('#cok').onclick = () => { closeDlg(); drawProducts(); };
}

/* mass price change + Excel (CSV) export / import, matched by product code */
function bulkDlg() {
  openDlg('Μαζικές αλλαγές & Excel', `
   <div class="sub" style="margin-top:0"><b>Αλλαγή τιμών με ένα κλικ</b>
    <div class="grid2"><label class="field"><span>Πόσο</span><input id="bp" inputmode="decimal" placeholder="π.χ. 10 ή -5"><small>% πάνω (θετικό) ή κάτω (αρνητικό)</small></label>
    <label class="field"><span>Σε ποια</span><select id="bc"><option value="">Όλα τα προϊόντα</option>${cats().map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label></div>
    <label class="check"><input type="checkbox" id="br" checked><span>Στρογγυλοποίηση σε ολόκληρο ευρώ</span></label>
    <button class="btn primary sm" id="bgo">Εφαρμογή</button></div>
   <div class="sub"><b>Excel</b><p style="margin:0 0 10px;color:var(--muted);font-size:14px">Κατεβάστε τη λίστα, αλλάξτε τιμές/ονόματα/απόθεμα στο Excel, σώστε ως CSV και ανεβάστε την ξανά. Ο «Κωδικός» δείχνει ποιο προϊόν είναι — μην τον αλλάξετε.</p>
    <div class="acts" style="margin:0"><button class="btn ghost sm" id="bx">Κατέβασμα λίστας</button><label class="btn ghost sm">Ανέβασμα λίστας<input type="file" accept=".csv,text/csv" id="bi" hidden></label></div><div id="bprev"></div></div>`, '');
  $('#bgo').onclick = () => {
    const pct = parseFloat(String($('#bp').value).replace(',', '.')); if (!Number.isFinite(pct) || pct === 0) { toast('Γράψτε ένα ποσοστό'); return; }
    const cat = $('#bc').value, round = $('#br').checked; let n = 0;
    const f = c => { let x = c * (100 + pct) / 100; x = round ? Math.round(x / 100) * 100 : Math.round(x); return Math.max(0, x); };
    S.cat.products.filter(p => !cat || p.cat === cat).forEach(p => { p.price = f(p.price); (p.variants || []).forEach(v => v.price = f(v.price)); n++; });
    closeDlg(); drawProducts(); markDirty(); toast(`Άλλαξαν ${n} προϊόντα — ελέγξτε και πατήστε Αποθήκευση`, 4000);
  };
  $('#bx').onclick = () => {
    const rows = [['Κωδικός', 'Όνομα', 'Επιλογή', 'Κατηγορία', 'Τιμή', 'ΦΠΑ', 'Ενεργό', 'Απόθεμα']];
    for (const p of prods()) {
      const cn = (S.cat.categories.find(c => c.id === p.cat) || {}).name || '';
      if (p.variants && p.variants.length) p.variants.forEach(v => rows.push([p.sku + '/' + v.id, p.name, v.name, cn, toInput(v.price), p.vat, p.active !== false ? 'ΝΑΙ' : 'ΟΧΙ', Number.isFinite(p.stock) ? p.stock : '']));
      else rows.push([p.sku, p.name, '', cn, toInput(p.price), p.vat, p.active !== false ? 'ΝΑΙ' : 'ΟΧΙ', Number.isFinite(p.stock) ? p.stock : '']);
    }
    download('proionta-' + new Date().toISOString().slice(0, 10) + '.csv', rows);
  };
  $('#bi').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    const rows = parseCsv(await f.text()); const head = rows.shift().map(h => h.trim().toLowerCase());
    const col = n => head.findIndex(h => h.startsWith(n));
    const iK = col('κωδ'), iN = col('όνομ'), iP = col('τιμ'), iA = col('ενερ'), iS = col('απόθ');
    if (iK < 0 || iP < 0) { $('#bprev').innerHTML = '<div class="err">Δεν βρέθηκαν οι στήλες «Κωδικός» και «Τιμή».</div>'; return; }
    const changes = [];
    for (const r of rows) {
      if (!r[iK]) continue; const [sku, vid] = r[iK].trim().split('/');
      const p = S.cat.products.find(x => (x.sku || '').toUpperCase() === sku.toUpperCase()); if (!p) { changes.push({ miss: r[iK] }); continue; }
      const price = toCents(r[iP]);
      if (vid) { const v = (p.variants || []).find(x => x.id === vid); if (v && Number.isFinite(price) && price !== v.price) changes.push({ p, v, price, txt: `${p.name} — ${v.name}: ${euro(v.price)} → ${euro(price)}` }); }
      else if (Number.isFinite(price) && price !== p.price) changes.push({ p, price, txt: `${p.name}: ${euro(p.price)} → ${euro(price)}` });
      if (iN >= 0 && r[iN] && r[iN].trim() !== p.name && !vid) changes.push({ p, name: r[iN].trim(), txt: `Όνομα: ${p.name} → ${r[iN].trim()}` });
      if (iA >= 0 && r[iA]) { const on = /^(ναι|nai|yes|1|true)$/i.test(r[iA].trim()); if (on !== (p.active !== false)) changes.push({ p, active: on, txt: `${p.name}: ${on ? 'εμφανίζεται' : 'κρύβεται'}` }); }
      if (iS >= 0) { const sv = r[iS] == null || r[iS].trim() === '' ? null : Math.max(0, Math.round(Number(r[iS]))); if (sv !== (Number.isFinite(p.stock) ? p.stock : null)) changes.push({ p, stock: sv, txt: `${p.name}: απόθεμα → ${sv ?? 'απεριόριστο'}` }); }
    }
    const real = changes.filter(c => c.p), miss = changes.filter(c => c.miss);
    $('#bprev').innerHTML = `<p style="margin:12px 0 6px"><b>${real.length} αλλαγές</b>${miss.length ? ` · ${miss.length} κωδικοί δεν βρέθηκαν` : ''}</p><div class="diff">${real.map(c => `<div>${esc(c.txt)}</div>`).join('') || 'Καμία αλλαγή'}</div>${real.length ? '<button class="btn primary sm" id="bapply" style="margin-top:10px">Εφαρμογή αλλαγών</button>' : ''}`;
    const ap = $('#bapply'); if (ap) ap.onclick = () => { for (const c of real) { if (c.v) c.v.price = c.price; else if (c.price != null) c.p.price = c.price; if (c.name) c.p.name = c.name; if (c.active != null) c.p.active = c.active; if ('stock' in c) c.p.stock = c.stock; } closeDlg(); drawProducts(); markDirty(); toast('Οι αλλαγές μπήκαν — πατήστε Αποθήκευση', 4000); };
  };
}
function parseCsv(t) {
  t = t.replace(/^﻿/, ''); const sep = (t.split('\n')[0].match(/;/g) || []).length >= (t.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < t.length; i++) { const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true; else if (ch === sep) { row.push(cur); cur = ''; } else if (ch === '\n') { row.push(cur.replace(/\r$/, '')); rows.push(row); row = []; cur = ''; } else cur += ch; }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}

/* ================= DISCOUNTS ================= */
function drawDisc() {
  const C = S.cat.coupons = S.cat.coupons || [], CS = S.cat.catSales = S.cat.catSales || [];
  const onSale = S.cat.products.filter(p => p.sale);
  $('#pane').innerHTML = `<h2>Εκπτώσεις</h2><p class="hint">Κωδικοί που δίνετε σε πελάτες, και προσφορές σε ολόκληρες κατηγορίες. Οι προσφορές σε ένα προϊόν μπαίνουν από το ίδιο το προϊόν.</p>
   <h3 style="font-size:18px;margin:6px 0 10px">Κωδικοί έκπτωσης</h3>
   <div class="cards2">${C.map((c, i) => `<div class="box" data-ci="${i}"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><input class="code" data-c="code" value="${esc(c.code)}" style="min-height:42px;border:1px solid #D5DDEA;border-radius:10px;padding:6px 12px;text-transform:uppercase;width:60%"><label class="sw"><input type="checkbox" data-c="active" ${c.active !== false ? 'checked' : ''} aria-label="Ενεργός"><i></i></label></div>
     <div class="grid2"><label class="field"><span>Είδος</span><select data-c="type"><option value="pct" ${c.type !== 'fixed' ? 'selected' : ''}>Ποσοστό %</option><option value="fixed" ${c.type === 'fixed' ? 'selected' : ''}>Ποσό €</option></select></label>
     <label class="field"><span>Αξία</span><input data-c="value" inputmode="decimal" value="${c.type === 'fixed' ? toInput(c.value) : c.value}"></label>
     <label class="field"><span>Ελάχιστη αγορά €</span><input data-c="min" inputmode="decimal" value="${toInput(c.min) || ''}" placeholder="καμία"></label>
     <label class="field"><span>Μέγιστες χρήσεις</span><input data-c="maxUses" inputmode="numeric" value="${c.maxUses || ''}" placeholder="απεριόριστες"></label>
     <label class="field"><span>Από</span><input type="date" data-c="from" value="${c.from || ''}"></label><label class="field"><span>Έως</span><input type="date" data-c="to" value="${c.to || ''}"></label></div>
     <div style="display:flex;justify-content:space-between;align-items:center"><small style="color:var(--muted)">Χρησιμοποιήθηκε ${c.uses || 0} φορές</small><button class="btn ghost sm red" data-cdel="${i}">Διαγραφή</button></div></div>`).join('')}</div>
   <button class="btn primary sm" id="cnew" style="margin:12px 0 30px">+ Νέος κωδικός</button>
   <h3 style="font-size:18px;margin:6px 0 10px">Προσφορά σε κατηγορία</h3>
   <div class="cards2">${CS.map((s, i) => `<div class="box" data-si="${i}"><div class="grid2"><label class="field"><span>Κατηγορία</span><select data-s="cat">${cats().map(c => `<option value="${esc(c.id)}" ${c.id === s.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
     <label class="field"><span>Έκπτωση %</span><input data-s="pct" inputmode="numeric" value="${s.pct}"></label><label class="field"><span>Από</span><input type="date" data-s="from" value="${s.from || ''}"></label><label class="field"><span>Έως</span><input type="date" data-s="to" value="${s.to || ''}"></label></div>
     <div style="display:flex;justify-content:space-between;align-items:center"><label class="sw"><input type="checkbox" data-s="active" ${s.active !== false ? 'checked' : ''} aria-label="Ενεργή"><i></i></label><button class="btn ghost sm red" data-sdel="${i}">Διαγραφή</button></div></div>`).join('')}</div>
   <button class="btn ghost sm" id="snew" style="margin:12px 0 30px">+ Προσφορά σε κατηγορία</button>
   ${onSale.length ? `<h3 style="font-size:18px;margin:6px 0 10px">Προϊόντα σε προσφορά</h3><div class="box">${onSale.map(p => `<div class="togrow"><div>${esc(p.name)}<small>${p.sale.pct ? '−' + p.sale.pct + '%' : euro(p.sale.price)}${p.sale.to ? ' · έως ' + p.sale.to : ''}</small></div><button class="btn ghost sm" data-goto="${esc(p.id)}">Άνοιγμα</button></div>`).join('')}</div>` : ''}`;
  $$('[data-ci]').forEach(b => { const c = C[b.dataset.ci];
    $$('[data-c]', b).forEach(el => el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => {
      const k = el.dataset.c;
      if (k === 'active') c.active = el.checked;
      else if (k === 'code') c.code = el.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      else if (k === 'type') { c.type = el.value; c.value = 0; drawDisc(); }
      else if (k === 'value') c.value = c.type === 'fixed' ? (toCents(el.value) || 0) : Math.max(0, Math.min(100, Math.round(Number(el.value) || 0)));
      else if (k === 'min') c.min = toCents(el.value) || 0;
      else if (k === 'maxUses') c.maxUses = Math.max(0, Math.round(Number(el.value) || 0));
      else c[k] = el.value || null;
      markDirty();
    })); });
  $$('[data-cdel]').forEach(b => b.onclick = async () => { if (await ask('Διαγραφή κωδικού', 'Να διαγραφεί ο κωδικός;', 'Διαγραφή', true)) { C.splice(Number(b.dataset.cdel), 1); drawDisc(); markDirty(); } });
  $('#cnew').onclick = () => { C.push({ code: 'KODIKOS' + Math.floor(Math.random() * 90 + 10), type: 'pct', value: 10, min: 0, from: null, to: null, maxUses: 0, uses: 0, active: true }); drawDisc(); markDirty(); };
  $$('[data-si]').forEach(b => { const s = CS[b.dataset.si];
    $$('[data-s]', b).forEach(el => el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => {
      const k = el.dataset.s; if (k === 'active') s.active = el.checked; else if (k === 'pct') s.pct = Math.max(1, Math.min(95, Math.round(Number(el.value) || 1))); else s[k] = el.value || null; markDirty();
    })); });
  $$('[data-sdel]').forEach(b => b.onclick = () => { CS.splice(Number(b.dataset.sdel), 1); drawDisc(); markDirty(); });
  $('#snew').onclick = () => { CS.push({ cat: cats()[0].id, pct: 10, from: null, to: null, active: true }); drawDisc(); markDirty(); };
  $$('[data-goto]').forEach(b => b.onclick = () => { S.tab = 'products'; S.open = b.dataset.goto; draw(); });
}

/* ================= SETTINGS ================= */
function drawSettings() {
  const s = S.cat.settings; s.bank = s.bank || {}; s.legal = s.legal || {}; s.shipping = s.shipping || {}; s.payments = s.payments || {};
  const st = (k, name) => S.pay[k] ? '<span class="status ok">Συνδεδεμένο ✓</span>' : `<span class="status no">${k === 'bank' ? 'Λείπει το IBAN' : 'Λείπουν τα κλειδιά ' + name}</span>`;
  const inp = (path, label, ph = '', help = '') => `<label class="field"><span>${label}</span><input data-s="${path}" value="${esc(path.split('.').reduce((o, k) => (o || {})[k], s) || '')}" placeholder="${esc(ph)}">${help ? `<small>${help}</small>` : ''}</label>`;
  $('#pane').innerHTML = `<h2>Ρυθμίσεις</h2><p class="hint">Μην ξεχάσετε την «Αποθήκευση» στο κάτω μέρος.</p>
   <div class="fs"><h3>Κατάστημα</h3>${inp('shopName', 'Όνομα')}${inp('tagline', 'Μικρή φράση')}${inp('notice', 'Ανακοίνωση στην κορυφή (προαιρετικά)', 'π.χ. Black Friday: −20% σε όλα!', 'Κενό = δεν εμφανίζεται.')}</div>
   <div class="fs"><h3>Ειδοποιήσεις & επικοινωνία</h3>${inp('notifyEmail', 'Πού έρχονται οι νέες παραγγελίες (e-mail)')}${inp('email', 'E-mail για τους πελάτες')}${inp('phone', 'Τηλέφωνο')}</div>
   <div class="fs"><h3>Πληρωμές</h3>
    <div class="togrow"><div>Κάρτα μέσω Stripe<small>Κάρτες, Apple Pay, Google Pay</small></div>${st('stripe', 'Stripe')}<label class="sw"><input type="checkbox" data-s="payments.stripe" ${s.payments.stripe !== false ? 'checked' : ''}><i></i></label></div>
    <div class="togrow"><div>Κάρτα / IRIS μέσω Viva<small>Κάρτες, IRIS, Apple Pay, Google Pay</small></div>${st('viva', 'Viva')}<label class="sw"><input type="checkbox" data-s="payments.viva" ${s.payments.viva !== false ? 'checked' : ''}><i></i></label></div>
    <small style="color:var(--muted);display:block;margin-bottom:8px">Η τραπεζική κατάθεση είναι κλειστή — κανένα IBAN δεν εμφανίζεται πουθενά.</small></div>
   <div class="fs" id="keysfs"><h3>Σύνδεση Stripe & Viva</h3>
    <p class="hint" style="margin:0 0 10px">Επικολλήστε εδώ τα κλειδιά (δείτε τον <a href="odigos/" target="_blank">οδηγό</a>). Αποθηκεύονται κρυφά στον server· η σελίδα δεν τα ξαναδείχνει, μόνο τα 4 τελευταία γράμματα. Ισχύουν αμέσως, χωρίς χρέωση credits.</p>
    <div id="keysbox"><p style="color:var(--muted)">Φορτώνει…</p></div></div>
   <div class="fs"><h3>Τιμές & τιμολόγια</h3>
    <div class="togrow"><div>Οι τιμές που γράφω περιέχουν ΦΠΑ<small>Κλειστό = γράφω «130 € + ΦΠΑ» (υπηρεσίες). Ανοιχτό = γράφω την τελική τιμή (λιανική).</small></div><label class="sw"><input type="checkbox" data-s="pricesIncludeVat" ${s.pricesIncludeVat ? 'checked' : ''}><i></i></label></div>
    <div class="togrow"><div>Ερώτηση «Θέλω τιμολόγιο»<small>Ο πελάτης γράφει ΑΦΜ, ΔΟΥ, διεύθυνση</small></div><label class="sw"><input type="checkbox" data-s="askInvoice" ${s.askInvoice !== false ? 'checked' : ''}><i></i></label></div></div>
   <div class="fs"><h3>Μεταφορικά</h3><div class="togrow"><div>Χρέωση μεταφορικών<small>Για e-shop με προϊόντα</small></div><label class="sw"><input type="checkbox" data-s="shipping.enabled" ${s.shipping.enabled ? 'checked' : ''}><i></i></label></div>
    <div class="grid2"><label class="field"><span>Κόστος</span><div class="money"><input data-sm="shipping.flat" inputmode="decimal" value="${toInput(s.shipping.flat)}"></div></label><label class="field"><span>Δωρεάν από</span><div class="money"><input data-sm="shipping.freeOver" inputmode="decimal" value="${toInput(s.shipping.freeOver)}" placeholder="ποτέ"></div></label></div></div>
   <div class="fs"><h3>Στοιχεία επιχείρησης (στο κάτω μέρος του καταστήματος)</h3>${inp('legal.name', 'Επωνυμία')}<div class="grid3">${inp('legal.afm', 'ΑΦΜ')}${inp('legal.doy', 'ΔΟΥ')}${inp('legal.gemi', 'Αρ. ΓΕΜΗ')}</div>${inp('legal.address', 'Διεύθυνση')}</div>
   <div class="fs"><h3>Ασφάλεια</h3><div class="togrow"><div>Αναίρεση τελευταίας αποθήκευσης<small>Φυλάμε τις τελευταίες 30 εκδόσεις του καταλόγου</small></div><button class="btn ghost sm" id="undo" ${S.undo ? '' : 'disabled'}>Αναίρεση</button></div>
   ${DEMO ? '<div class="togrow"><div>Επαναφορά δοκιμής<small>Σβήνει τις δοκιμαστικές αλλαγές και παραγγελίες αυτού του browser</small></div><button class="btn ghost sm red" id="reset">Επαναφορά</button></div>' : ''}</div>`;
  $$('[data-s]').forEach(el => el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => {
    const path = el.dataset.s.split('.'); let o = s; while (path.length > 1) o = o[path.shift()];
    o[path[0]] = el.type === 'checkbox' ? el.checked : el.value; markDirty();
  }));
  $$('[data-sm]').forEach(el => el.addEventListener('input', () => { const [a, b] = el.dataset.sm.split('.'); s[a][b] = toCents(el.value) || 0; markDirty(); }));
  $('#undo').onclick = async () => { if (!(await ask('Αναίρεση', 'Να επιστρέψει ο κατάλογος όπως ήταν πριν από την τελευταία αποθήκευση;', 'Αναίρεση'))) return; const r = await api('undo'); if (r.ok) { setCat(r.catalog); S.undo = Math.max(0, S.undo - 1); draw(); toast('Έγινε αναίρεση'); } else toast(r.error); };
  drawKeys();
  const rs = $('#reset'); if (rs) rs.onclick = async () => { if (!(await ask('Επαναφορά', 'Να σβηστούν όλες οι δοκιμαστικές αλλαγές και παραγγελίες;', 'Επαναφορά', true))) return; ['advon-shop:demo-catalog', 'advon-shop:demo-orders', 'advon-shop:demo-history', 'advon-shop:cart'].forEach(k => LS.del(k)); resetDemoCache(); start(); };
}


/* ---------- payment keys (kept on the server, never in the catalogue) ---------- */
const KEYDEF = [
  ['Stripe', [['STRIPE_SECRET_KEY', 'Secret key', 'sk_live_…'], ['STRIPE_WEBHOOK_SECRET', 'Webhook signing secret', 'whsec_…']]],
  ['Viva', [['VIVA_ENV', 'Περιβάλλον', 'live ή demo'], ['VIVA_CLIENT_ID', 'Client ID (Smart Checkout)', ''], ['VIVA_CLIENT_SECRET', 'Client Secret', ''], ['VIVA_SOURCE_CODE', 'Source code (4 ψηφία)', 'π.χ. 1234'], ['VIVA_MERCHANT_ID', 'Merchant ID', ''], ['VIVA_API_KEY', 'API Key', '']]],
  ['E-mail επιβεβαιώσεων', [['RESEND_API_KEY', 'Resend API key', 're_…']]]
];
async function drawKeys() {
  const box = $('#keysbox'); if (!box) return;
  if (DEMO) { box.innerHTML = '<p style="color:var(--muted)">Στη δοκιμαστική έκδοση δεν μπαίνουν κλειδιά. Θα τα βάλετε στο κανονικό κατάστημα, εδώ ακριβώς.</p>'; return; }
  const r = await api('keys'); if (!r.ok) { box.textContent = r.error || 'Σφάλμα'; return; }
  box.innerHTML = KEYDEF.map(([g, ks]) => `<div class="sub"><b>${g}</b><div class="grid2">${ks.map(([k, l, ph]) => { const v = r.keys[k] || {};
    return `<label class="field"><span>${l} ${v.set ? `<span class="status ok">✓ ${esc(v.end)}${v.fromHosting ? ' (hosting)' : ''}</span>` : '<span class="status no">κενό</span>'}</span><input data-key="${k}" type="${k === 'VIVA_ENV' || k === 'VIVA_SOURCE_CODE' ? 'text' : 'password'}" autocomplete="off" spellcheck="false" placeholder="${v.set ? 'αφήστε κενό για να μείνει ίδιο' : esc(ph)}"></label>`; }).join('')}</div></div>`).join('')
    + `<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary" id="ksave">Αποθήκευση κλειδιών</button><button class="btn ghost sm" id="kclear">Διαγραφή κλειδιού…</button></div>`;
  $('#ksave').onclick = async () => {
    const keys = {}; $$('[data-key]').forEach(i => { if (i.value.trim()) keys[i.dataset.key] = i.value.trim(); });
    if (!Object.keys(keys).length) return toast('Δεν γράψατε κάποιο κλειδί.');
    const x = await api('setKeys', { keys }); if (!x.ok) return toast(x.error);
    S.pay = x.pay || S.pay; toast('Τα κλειδιά αποθηκεύτηκαν'); draw();
  };
  $('#kclear').onclick = async () => {
    const name = prompt('Ποιο κλειδί να διαγραφεί; Γράψτε το όνομα, π.χ. STRIPE_SECRET_KEY'); if (!name) return;
    const x = await api('setKeys', { keys: { [name.trim().toUpperCase()]: '' } }); if (!x.ok) return toast(x.error);
    S.pay = x.pay || S.pay; toast('Διαγράφηκε'); draw();
  };
}

/* ---------- go ---------- */
if (DEMO || LS.get(TOKEN, '')) start().catch(() => showLogin()); else showLogin();
