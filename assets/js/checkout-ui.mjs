/* Advon Shop — the checkout form (used by the shop and by the renewal page).
   Sends only: products, variants, quantities, notes, coupon, buyer details. The server prices it again. */
import { checkout, DEMO } from './common.mjs';
import { esc, icon } from './render.mjs';
import { euro } from './pricing.mjs';

export function formHtml(cat) {
  const pay = cat.pay || {};
  const m = [];
  if (pay.stripe) m.push(['stripe', 'Κάρτα, Apple Pay, Google Pay', 'Ασφαλής σελίδα πληρωμής']);
  if (pay.viva) m.push(['viva', 'Κάρτα ή IRIS', 'Ασφαλής σελίδα πληρωμής']);
  if (pay.bank) m.push(['bank', 'Τραπεζική κατάθεση', 'Ξεκινάμε μόλις δούμε την κατάθεση']);
  return `<form class="cf" novalidate>
   <h3 class="subh" style="margin-top:22px">Τα στοιχεία σας</h3>
   <label class="field"><span>Ονοματεπώνυμο</span><input name="name" autocomplete="name" required></label>
   <div class="row2"><label class="field"><span>E-mail</span><input name="email" type="email" autocomplete="email" inputmode="email" required></label>
   <label class="field"><span>Κινητό</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required></label></div>
   <label class="check"><input type="checkbox" name="invoice"><span>Θέλω τιμολόγιο</span></label>
   <div class="inv" hidden>
    <label class="field"><span>Επωνυμία</span><input name="company" autocomplete="organization"></label>
    <div class="row2"><label class="field"><span>ΑΦΜ</span><input name="afm" inputmode="numeric" maxlength="9"></label><label class="field"><span>ΔΟΥ</span><input name="doy"></label></div>
    <label class="field"><span>Διεύθυνση</span><input name="address" autocomplete="street-address"></label>
   </div>
   <label class="field"><span>Σημείωση (προαιρετικά)</span><textarea name="notes" rows="2" placeholder="Κάτι που θέλετε να ξέρουμε"></textarea></label>
   <input name="website" tabindex="-1" autocomplete="off" class="sr" aria-hidden="true">
   <h3 class="subh" style="margin-top:22px">Πληρωμή</h3>
   <div class="paym">${m.map((x, i) => `<label class="pm"><input type="radio" name="method" value="${x[0]}"${i ? '' : ' checked'}><span><b>${x[1]}</b><small>${x[2]}</small></span></label>`).join('') || '<p class="small">Οι πληρωμές ενεργοποιούνται σύντομα.</p>'}</div>
   <label class="check"><input type="checkbox" name="terms" required><span>Αποδέχομαι τους <a href="oroi.html" target="_blank">όρους αγοράς</a> και την <a href="privacy.html" target="_blank">πολιτική απορρήτου</a>.</span></label>
   <div class="err" role="alert"></div>
   <button class="btn primary lg block" type="submit"${m.length ? '' : ' disabled'}>${icon('lock')} <span class="go-t">Πληρωμή</span></button>
   <p class="secure">${icon('lock')} ${DEMO ? 'Δοκιμαστική έκδοση — δεν χρεώνεται τίποτα' : 'Τα στοιχεία της κάρτας δεν περνούν ποτέ από εμάς'}</p>
  </form>`;
}

/* opts: items(), coupon(), total() (cents, as shown), onPriced(priced) */
export function bindForm(root, opts) {
  const f = root.querySelector('form.cf'); if (!f) return;
  const inv = f.querySelector('.inv'), err = f.querySelector('.err'), btn = f.querySelector('button[type=submit]');
  f.invoice.addEventListener('change', () => { inv.hidden = !f.invoice.checked; });
  const setT = () => { const t = opts.total(); f.querySelector('.go-t').textContent = t != null ? 'Πληρωμή ' + euro(t, { always2: true }) : 'Πληρωμή'; };
  setT(); f._setT = setT;
  f.addEventListener('submit', async (e) => {
    e.preventDefault(); err.textContent = '';
    const v = n => (f[n] && f[n].value || '').trim();
    const customer = { name: v('name'), email: v('email'), phone: v('phone'), invoice: f.invoice.checked, company: v('company'), afm: v('afm'), doy: v('doy'), address: v('address'), notes: v('notes') };
    const bad = [];
    if (customer.name.length < 3) bad.push('Γράψτε το ονοματεπώνυμό σας.');
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(customer.email)) bad.push('Το e-mail δεν φαίνεται σωστό.');
    if (customer.phone.replace(/\D/g, '').length < 10) bad.push('Γράψτε ένα τηλέφωνο επικοινωνίας.');
    if (customer.invoice && (customer.afm.replace(/\D/g, '').length !== 9 || !customer.company || !customer.doy || !customer.address)) bad.push('Για τιμολόγιο χρειάζονται επωνυμία, ΑΦΜ (9 ψηφία), ΔΟΥ και διεύθυνση.');
    if (!f.terms.checked) bad.push('Αποδεχτείτε τους όρους αγοράς.');
    const method = (f.querySelector('input[name=method]:checked') || {}).value;
    if (!method) bad.push('Διαλέξτε τρόπο πληρωμής.');
    if (bad.length) { err.textContent = bad.join(' '); return; }
    btn.disabled = true; btn.querySelector('.go-t').textContent = 'Μεταφορά στην πληρωμή…';
    try {
      const d = await checkout({ items: opts.items(), coupon: opts.coupon(), customer, method, terms: true, website: v('website'), expectTotal: opts.total() });
      if (d.ok && d.url) { location.href = d.url; return; }
      err.textContent = d.error || 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.';
      if (d.priced && opts.onPriced) opts.onPriced(d.priced);
    } catch (x) { err.textContent = 'Δεν υπάρχει σύνδεση. Δοκιμάστε ξανά.'; }
    btn.disabled = false; setT();
  });
  return f;
}

export function linesHtml(priced, { removable = false, lockKinds = {} } = {}) {
  return priced.lines.map((l, i) => `<div class="sl">
    <div><div class="nm">${l.qty > 1 ? l.qty + ' × ' : ''}${esc(l.name)}</div>${l.vname ? `<div class="vn">${esc(l.vname)}</div>` : ''}${l.note ? `<div class="nt">«${esc(l.note)}»</div>` : ''}</div>
    <div class="am">${l.unitPrice === 0 ? 'Δωρεάν' : euro(l.amount)}${l.unit === 'year' ? '<small>για 1 χρόνο</small>' : l.unit === 'month' ? '<small>1ος μήνας</small>' : ''}</div>
   </div>`).join('');
}

export function totalsHtml(priced) {
  const sub = priced.lines.reduce((a, l) => a + l.amount, 0);
  return `<div class="tot">
   <div><span>Υποσύνολο</span><span>${euro(sub, { always2: true })}</span></div>
   ${priced.discount ? `<div class="disc"><span>Έκπτωση ${esc(priced.coupon ? priced.coupon.code : '')}</span><span>−${euro(priced.discount, { always2: true })}</span></div>` : ''}
   <div><span>ΦΠΑ 24%</span><span>${euro(priced.vat, { always2: true })}</span></div>
   <div class="big"><span>Σήμερα</span><span>${euro(priced.total, { always2: true })}</span></div></div>`;
}
