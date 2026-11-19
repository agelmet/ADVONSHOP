/* Advon Shop — «thank you» page: shows the order and its payment status */
import { getOrder, demoPay, cart, DEMO } from './common.mjs';
import { euro } from './pricing.mjs';
import { esc } from './render.mjs';

const box = document.getElementById('o');
const params = new URLSearchParams(location.search);
const ICON = {
  ok: '<div class="oic ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div>',
  wait: '<div class="oic wait"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div>',
  no: '<div class="oic no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></div>'
};
let tries = 0;

function toast(m) { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2000); }
window.copyTxt = (t) => { navigator.clipboard && navigator.clipboard.writeText(t).then(() => toast('Αντιγράφηκε')); };

function render(o) {
  if (!o.ok) { box.innerHTML = `<div class="ostate">${ICON.no}<div><h1>Δεν βρέθηκε η παραγγελία</h1><p>${esc(o.error || '')}</p></div></div><a class="btn outline" href="index.html">Πίσω στο κατάστημα</a>`; return; }
  const pr = o.priced;
  if (params.get('fail') === '1' && o.status === 'pending') o.status = 'failed';
  const st = {
    paid: [ICON.ok, `Ευχαριστούμε${o.name ? ', ' + esc(o.name) : ''}!`, 'Η πληρωμή ολοκληρώθηκε. Σας στείλαμε e-mail επιβεβαίωσης.'],
    done: [ICON.ok, 'Η παραγγελία ολοκληρώθηκε', 'Ευχαριστούμε!'],
    awaiting_transfer: [ICON.wait, 'Μένει μόνο η κατάθεση', 'Κάντε την κατάθεση με τα στοιχεία παρακάτω. Ξεκινάμε μόλις τη δούμε.'],
    pending: [ICON.wait, 'Περιμένουμε την επιβεβαίωση της πληρωμής', 'Συνήθως παίρνει λίγα δευτερόλεπτα…'],
    failed: [ICON.no, 'Η πληρωμή δεν ολοκληρώθηκε', 'Δεν έγινε καμία χρέωση. Μπορείτε να δοκιμάσετε ξανά.'],
    cancelled: [ICON.no, 'Η παραγγελία ακυρώθηκε', ''], refunded: [ICON.no, 'Έγινε επιστροφή χρημάτων', '']
  }[o.status] || [ICON.wait, o.status, ''];
  if (o.status === 'paid' || o.status === 'awaiting_transfer') cart.clear();
  const b = o.bank;
  box.innerHTML = `<div class="ostate">${st[0]}<div><h1>${st[1]}</h1><p>${st[2]}</p></div></div>
   ${o.demo && o.status === 'pending' ? `<div class="demopay"><b>Δοκιμαστική πληρωμή</b><br>Εδώ, στο κανονικό κατάστημα, ο πελάτης θα ήταν στη σελίδα πληρωμής της ${o.method === 'viva' ? 'Viva' : 'Stripe'}. Τίποτα δεν χρεώνεται.<div class="b2"><button class="btn primary" id="dOk">Η πληρωμή πέτυχε</button><button class="btn outline" id="dNo">Ακύρωση πληρωμής</button></div></div>` : ''}
   ${o.status === 'awaiting_transfer' && b ? `<div class="bankbox">
     <div><span>Τράπεζα</span><b>${esc(b.bankName)}</b></div>
     <div><span>IBAN</span><b>${esc(b.iban)} <button class="copy" onclick="copyTxt('${esc(b.iban)}')">Αντιγραφή</button></b></div>
     <div><span>Επωνυμία</span><b>${esc(b.holder)}</b></div>
     <div><span>Αιτιολογία</span><b>${esc(o.id)} <button class="copy" onclick="copyTxt('${esc(o.id)}')">Αντιγραφή</button></b></div>
     <div><span>Ποσό</span><b>${euro(pr.total, { always2: true })}</b></div></div>` : ''}
   <p style="color:var(--mu);font-size:14px;margin:18px 0 6px">Παραγγελία <b style="color:#fff">${esc(o.id)}</b></p>
   <div>${pr.lines.map(l => `<div class="sl"><div><div class="nm">${l.qty > 1 ? l.qty + ' × ' : ''}${esc(l.name)}</div>${l.vname ? `<div class="vn">${esc(l.vname)}</div>` : ''}${l.note ? `<div class="nt">«${esc(l.note)}»</div>` : ''}</div><div class="am">${euro(l.gross, { always2: true })}</div></div>`).join('')}</div>
   <div class="tot" style="margin-top:12px">${pr.discount ? `<div class="disc"><span>Μέσα στις τιμές: έκπτωση ${esc(pr.coupon ? pr.coupon.code : '')}</span><span>−${euro(pr.discount, { always2: true })}</span></div>` : ''}<div><span>ΦΠΑ</span><span>${euro(pr.vat, { always2: true })}</span></div><div class="big"><span>Σύνολο</span><span>${euro(pr.total, { always2: true })}</span></div></div>
   <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px">${o.status === 'failed' ? '<a class="btn primary" href="index.html#cart">Δοκιμάστε ξανά</a>' : ''}<a class="btn outline" href="index.html">Πίσω στο κατάστημα</a></div>`;
  const ok = document.getElementById('dOk'), no = document.getElementById('dNo');
  if (ok) ok.onclick = async () => { await demoPay(o.id, true); load(); };
  if (no) no.onclick = async () => { await demoPay(o.id, false); load(); };
  /* the payment company usually tells the server within seconds — check again for up to a minute */
  if (o.status === 'pending' && !o.demo && tries++ < 20) setTimeout(load, 3000);
}

async function load() { try { render(await getOrder(params)); } catch (e) { render({ ok: false, error: 'Δεν υπάρχει σύνδεση.' }); } }
load();
