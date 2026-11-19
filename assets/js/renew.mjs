/* Advon Shop — renewal page: one product («renew»), the site's address and the plan. Its own checkout, separate from the shop's cart. */
import { loadCatalog, quote, DEMO, LS } from './common.mjs';
import { esc, bullets } from './render.mjs';
import { euro } from './pricing.mjs';
import { formHtml, bindForm, totalsHtml } from './checkout-ui.mjs';

const $ = s => document.querySelector(s);
document.documentElement.classList.add('js');
const KEY = 'advon-shop:renew';
let cat, st = LS.get(KEY, { domain: '', v: 'hosting' }), priced = null, form = null, q = 0;
const items = () => [{ id: 'renew', v: st.v, qty: 1, note: st.domain.trim() }];
const ok = () => /\.[a-z]{2,}/i.test(st.domain.trim());

function plans() {
  const p = (cat.products || []).find(x => x.id === 'renew'); if (!p) return '';
  const info = { hosting: (cat.products.find(x => x.id === 'hosting') || {}), growth: (cat.products.find(x => x.id === 'growth') || {}) };
  return p.variants.map(v => { const on = st.v === v.id, d = info[v.id] || {};
    return `<button type="button" class="host${on ? ' on' : ''}" data-v="${esc(v.id)}" aria-pressed="${on}"><span class="radio"></span><div class="hb"><div class="hh"><h3>${esc(v.name)}</h3></div><p>${esc(d.short || '')}</p>${bullets(d.desc || '')}</div>
     <div class="price"><b class="pr">${euro(v.price)}</b><small>/ έτος + ΦΠΑ</small></div></button>`; }).join('');
}
async function refresh() {
  $('#rplans').innerHTML = plans();
  if (!ok()) { priced = null; $('#rbody').innerHTML = '<div class="empty">Γράψτε τη διεύθυνση της σελίδας σας (π.χ. onoma.gr).</div>'; if (form) form.querySelector('button[type=submit]').disabled = true; return; }
  const my = ++q; try { const pr = await quote(items(), ''); if (my !== q) return; priced = pr; } catch (e) { return; }
  $('#rbody').innerHTML = priced.lines.map(l => `<div class="sl"><div><div class="nm">${esc(l.name)}</div><div class="vn">${esc(l.vname || '')}</div><div class="nt">για ${esc(l.note)}</div></div><div class="am">${euro(l.amount)}<small>για 1 χρόνο</small></div></div>`).join('') + totalsHtml(priced) + (priced.errors.length ? `<div class="err">${esc(priced.errors.join(' '))}</div>` : '');
  if (!form) { $('#rform').innerHTML = formHtml(cat); form = bindForm($('#rform'), { items, coupon: () => '', total: () => priced ? priced.total : null }); }
  form._setT(); form.querySelector('button[type=submit]').disabled = !!priced.errors.length || !(cat.pay.stripe || cat.pay.viva || cat.pay.bank);
}
document.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) { st.v = b.dataset.v; LS.set(KEY, st); refresh(); } });
$('#rdom').addEventListener('input', e => { st.domain = e.target.value; LS.set(KEY, st); clearTimeout(e.target._t); e.target._t = setTimeout(refresh, 250); });
(async () => {
  if (DEMO) $('#demobar').hidden = false;
  const u = new URLSearchParams(location.search); if (u.get('site')) st.domain = u.get('site'); if (u.get('plan') === 'growth') st.v = 'growth';
  $('#rdom').value = st.domain;
  try { cat = await loadCatalog(); } catch (e) { cat = JSON.parse($('#seed').textContent); cat.pay = {}; }
  refresh();
})();
