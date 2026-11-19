/* Advon Shop — HTML pieces of the store. Used by the page AND by the build (so Google sees the real services). */
import { unitPrice, UNITS, euro, athensDay } from './pricing.mjs';

export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const ICONS = {
  site: '<path d="M3 5h18v14H3z"/><path d="M3 9h18M7 7h.01M10 7h.01"/>',
  shop: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  stay: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  mail: '<path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h8"/>',
  social: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><path d="M17 7h.01"/>',
  ads: '<path d="M4 15V9l11-5v16L4 15z"/><path d="M15 9a3 3 0 0 1 0 6M7 15l1.5 5h3L10 15.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M8 14h3"/>',
  ai: '<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z"/>',
  edit: '<path d="M4 20h16"/><path d="M6 16l9-9 3 3-9 9H6z"/>',
  qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
  bundle: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', cart: '<path d="M3 4h2l2.4 11h11L21 7H6.2"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>', star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>', file: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>'
};
export const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.plus}</svg>`;

export const lines = t => String(t || '').split('\n').map(s => s.trim()).filter(Boolean).map(l => l.replace(/^[•\-*]\s?/, ''));
export function bullets(text, max = 99) {
  const li = lines(text).slice(0, max).map(l => `<li>${icon('check')}<span>${esc(l)}</span></li>`).join('');
  return li ? `<ul class="ticks">${li}</ul>` : '';
}

export const unitEl = u => (UNITS[u || 'once'] || UNITS.once).el;
export const vatPlus = cat => cat.settings && cat.settings.pricesIncludeVat ? '' : ' + ΦΠΑ';
export const listed = cat => (cat.products || []).filter(p => p.active !== false && p.listed !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
export const inCat = (cat, id) => listed(cat).filter(p => p.cat === id);
export const catOf = (cat, id) => (cat.categories || []).find(c => c.id === id) || { name: '', desc: '' };
export const byId = (cat, id) => (cat.products || []).find(p => p.id === id);
const imgOf = (p, big) => p.img ? (big ? p.img : p.img.replace(/\.webp$/, '-600.webp')) : '';

export function fromPrice(cat, p, day = athensDay()) {
  if (p.variants && p.variants.length) {
    const all = p.variants.map(v => unitPrice(cat, p, v.id, day)).filter(Boolean);
    return { ...all.reduce((a, b) => (b.price < a.price ? b : a), all[0]), from: new Set(all.map(x => x.price)).size > 1 };
  }
  return { ...unitPrice(cat, p, null, day), from: false };
}
export function priceTxt(cat, p, vId) {
  const u = vId ? unitPrice(cat, p, vId) : fromPrice(cat, p);
  if (p.quote) return '<b class="pr">Κατόπιν προσφοράς</b>';
  if (!u || u.price == null) return '';
  if (u.price === 0 && p.kind === 'build') return '<b class="pr free">Δωρεάν κατασκευή</b>';
  if (u.price === 0 && p.unit === 'month') return `<b class="pr free">0 €</b><small>1ος μήνας</small>`;
  const was = u.original > u.price ? `<s>${euro(u.original)}</s> ` : (p.compareAt && p.compareAt > u.price ? `<s>${euro(p.compareAt)}</s> ` : '');
  return `${u.from && !vId ? '<small>από</small> ' : ''}${was}<b class="pr">${euro(u.price)}</b><small>${esc(unitEl(p.unit))}${u.price ? vatPlus(cat) : ''}</small>`;
}
const variantOf = (p, st) => p.variants && p.variants.length ? ((st.vOf || {})[p.id] || p.variants[0].id) : null;
export function includesTxt(cat, ref) {
  const [id, v] = String(ref).split(':'); const p = byId(cat, id); if (!p) return id;
  const vv = v && (p.variants || []).find(x => x.id === v);
  return p.name + (vv ? ' · ' + vv.name : '');
}
export function includesSum(cat, p) {
  return (p.includes || []).reduce((a, ref) => { const [id, v] = ref.split(':'); const q = byId(cat, id); if (!q) return a; const u = unitPrice(cat, q, v || null); return a + (u ? (u.price || (q.priceNote && /59/.test(q.priceNote) ? 5900 : 0)) : 0); }, 0);
}

/* ---------- one product card ---------- */
export function card(cat, p, st = {}, { wide = false } = {}) {
  const inCart = (st.ids || []).includes(p.id);
  const vId = variantOf(p, st);
  const k = catOf(cat, p.cat).name;
  const vs = (p.variants || []).length > 1 && p.kind !== 'build' ? `<div class="vs" role="group" aria-label="Επιλογή">${p.variants.map(v => `<button type="button" class="vchip${vId === v.id ? ' on' : ''}" data-pv="${esc(p.id)}" data-v="${esc(v.id)}" aria-pressed="${vId === v.id}">${esc(v.name)}</button>`).join('')}</div>` : '';
  const quote = p.quote;
  const btn = quote ? `<a class="add" href="https://advonmedia.com/#contact">Ζητήστε προσφορά ${icon('arrow')}</a>`
    : p.kind === 'build' ? `<button type="button" class="add" data-open="${esc(p.id)}" data-step="buy">${inCart ? icon('check') + ' Στο καλάθι' : 'Επιλογή'}</button>`
    : `<button type="button" class="add${inCart ? ' on' : ''}" data-add="${esc(p.id)}">${inCart ? icon('check') + ' Στο καλάθι' : icon('cart') + ' Προσθήκη'}</button>`;
  return `<article class="pc${wide ? ' wide' : ''}${inCart ? ' in' : ''}" data-pid="${esc(p.id)}">
   <button type="button" class="pimg" data-open="${esc(p.id)}" aria-label="Λεπτομέρειες: ${esc(p.name)}">${p.img ? `<img src="${esc(imgOf(p))}" srcset="${esc(imgOf(p))} 600w, ${esc(imgOf(p, true))} 1200w" sizes="${wide ? '(max-width:900px) 100vw, 600px' : '(max-width:700px) 100vw, (max-width:1100px) 50vw, 400px'}" width="600" height="450" alt="${esc(p.name)}" loading="lazy" decoding="async">` : `<span class="pic">${icon(p.icon)}</span>`}
    ${inCart ? `<span class="incart">${icon('check')} Στο καλάθι</span>` : ''}</button>
   <div class="pb">
    <div class="pk">${esc(k)}${p.badge ? `<span class="badge s">${esc(p.badge)}</span>` : ''}</div>
    <h3><button type="button" data-open="${esc(p.id)}">${esc(p.name)}</button></h3>
    <p class="ps">${esc(p.short)}</p>
    ${bullets(p.desc, wide ? 5 : 3)}
    ${vs}
    <div class="pf"><div class="pp"><div class="price">${priceTxt(cat, p, vs ? vId : undefined)}</div>${p.priceNote ? `<div class="pnote">${esc(p.priceNote)}</div>` : ''}</div>
     <div class="pa">${btn}<button type="button" class="det" data-open="${esc(p.id)}">Λεπτομέρειες</button></div></div>
   </div></article>`;
}

export function grid(cat, catId, st) {
  const ps = inCat(cat, catId);
  if (ps.length === 1) return `<div class="pgrid g1">${card(cat, ps[0], st, { wide: true })}</div>`;
  return `<div class="pgrid g${Math.min(3, ps.length)}">${ps.map(p => card(cat, p, st)).join('')}</div>`;
}

/* hosting comparison under the websites */
export function hostingStrip(cat) {
  const h = byId(cat, 'hosting'), g = byId(cat, 'growth'); if (!h || !g) return '';
  const col = (p, rec) => `<div class="hc${rec ? ' rec' : ''}"><div class="hct"><b>${esc(p.name)}</b>${p.badge ? `<span class="badge s">${esc(p.badge)}</span>` : ''}</div><div class="price">${priceTxt(cat, p)}</div><p>${esc(p.short)}</p>${bullets(p.desc)}</div>`;
  return `<div class="hstrip"><div class="hsi"><span class="hico">${icon('shield')}</span><div><h3>Φιλοξενία — μπαίνει μαζί με κάθε ιστοσελίδα</h3><p>Τη διαλέγετε όταν προσθέτετε την ιστοσελίδα στο καλάθι. Το domain name είναι δώρο. Η ανανέωση γίνεται κάθε χρόνο από τη σελίδα <a href="ananeosi.html">Ανανέωση</a>.</p></div></div><div class="hcols">${col(h)}${col(g, true)}</div></div>`;
}

/* ---------- bundles ---------- */
export function bundles(cat, st = {}) {
  const ps = inCat(cat, 'bundles');
  return `<div class="pgrid g${Math.min(3, ps.length)}">${ps.map(p => {
    const inCart = (st.ids || []).includes(p.id), sum = p.compareAt || includesSum(cat, p), u = unitPrice(cat, p, null), save = sum - (u ? u.price : 0);
    return `<article class="pc bc${p.badge ? ' hot' : ''}${inCart ? ' in' : ''}" data-pid="${esc(p.id)}">
     <button type="button" class="pimg" data-open="${esc(p.id)}" aria-label="Λεπτομέρειες: ${esc(p.name)}">${p.img ? `<img src="${esc(imgOf(p))}" srcset="${esc(imgOf(p))} 600w, ${esc(imgOf(p, true))} 1200w" sizes="(max-width:700px) 100vw, 400px" width="600" height="450" alt="Πακέτο ${esc(p.name)}" loading="lazy" decoding="async">` : ''}
      ${save > 0 ? `<span class="save">−${euro(save)} / μήνα</span>` : ''}</button>
     <div class="pb"><div class="pk">Πακέτο${p.badge ? `<span class="badge s">${esc(p.badge)}</span>` : ''}</div><h3><button type="button" data-open="${esc(p.id)}">${esc(p.name)}</button></h3>
      <ul class="ticks inc">${(p.includes || []).map(r => `<li>${icon('check')}<span>${esc(includesTxt(cat, r))}</span></li>`).join('')}</ul>
      <div class="pf"><div class="pp"><div class="price">${priceTxt(cat, p)}</div>${p.priceNote ? `<div class="pnote">${esc(p.priceNote)}</div>` : ''}</div>
      <div class="pa"><button type="button" class="add${inCart ? ' on' : ''}" data-add="${esc(p.id)}">${inCart ? icon('check') + ' Στο καλάθι' : icon('cart') + ' Προσθήκη'}</button><button type="button" class="det" data-open="${esc(p.id)}">Λεπτομέρειες</button></div></div></div></article>`;
  }).join('')}</div>`;
}

/* ---------- add-ons, by group ---------- */
export function extras(cat, st = {}) {
  const ps = inCat(cat, 'extras'), groups = [];
  ps.forEach(p => { const g = p.group || 'Προσθήκες'; let x = groups.find(y => y.n === g); if (!x) groups.push(x = { n: g, ps: [] }); x.ps.push(p); });
  return groups.map(g => `<div class="xg"><h3 class="xgh">${esc(g.n)}</h3><div class="xgrid c${g.ps.length % 3 === 0 ? 3 : g.ps.length % 2 === 0 ? 2 : 3}">${g.ps.map(p => {
    const inCart = (st.ids || []).includes(p.id), blocked = (p.notWith || []).some(id => (st.ids || []).includes(id));
    const vId = variantOf(p, st);
    return `<article class="xc${inCart ? ' in' : ''}" data-pid="${esc(p.id)}">
     <button type="button" class="ximg" data-open="${esc(p.id)}" aria-label="Λεπτομέρειες: ${esc(p.name)}">${p.img ? `<img src="${esc(imgOf(p))}" width="600" height="450" alt="${esc(p.name)}" loading="lazy" decoding="async">` : `<span class="pic">${icon(p.icon)}</span>`}</button>
     <div class="xb"><h4><button type="button" data-open="${esc(p.id)}">${esc(p.name)}</button></h4><p>${esc(blocked ? 'Περιλαμβάνεται ήδη στο Growth.' : p.short)}</p>
      ${(p.variants || []).length > 1 ? `<div class="vs sm">${p.variants.map(v => `<button type="button" class="vchip${vId === v.id ? ' on' : ''}" data-pv="${esc(p.id)}" data-v="${esc(v.id)}">${esc(v.name)}</button>`).join('')}</div>` : ''}
      <div class="xf"><div class="price">${priceTxt(cat, p, (p.variants || []).length > 1 ? vId : undefined)}</div>
       <button type="button" class="add sm${inCart ? ' on' : ''}" data-add="${esc(p.id)}" ${blocked ? 'disabled' : ''} aria-label="${inCart ? 'Στο καλάθι' : 'Προσθήκη'}: ${esc(p.name)}">${inCart ? icon('check') : icon('plus')}</button></div></div></article>`;
  }).join('')}</div></div>`).join('');
}

/* ---------- existing clients + more ---------- */
export function clientsBlock(cat) {
  const ch = byId(cat, 'changes');
  return `<div class="cgrid">
   ${ch ? `<div class="cc"><span class="cico">${icon('edit')}</span><h3>${esc(ch.name)}</h3><p>${esc(ch.short)}</p><div class="price">${priceTxt(cat, ch)}</div>
     <label class="fl"><span>Ποια είναι η ιστοσελίδα σας;</span><input id="chgDom" placeholder="π.χ. onoma.gr" inputmode="url" autocomplete="url"></label>
     <button type="button" class="add" data-chgadd>${icon('cart')} Προσθήκη</button></div>` : ''}
   <a class="cc link" href="ananeosi.html"><span class="cico">${icon('cal')}</span><h3>Ανανέωση φιλοξενίας</h3><p>Ανανεώστε τη φιλοξενία της σελίδας σας για έναν ακόμα χρόνο — σε ένα λεπτό, με κάρτα ή IRIS.</p><div class="price"><small>από</small> <b class="pr">130 €</b><small>/ έτος + ΦΠΑ</small></div><span class="add ghost">Ανανέωση ${icon('arrow')}</span></a>
  </div>`;
}
export function moreBlock(cat, st) { return grid(cat, 'more', st); }

/* ---------- product details (modal) ---------- */
export function details(cat, p, st = {}) {
  const vId = variantOf(p, st), inCart = (st.ids || []).includes(p.id);
  const steps = lines(p.steps);
  const isB = p.kind === 'build', isBundle = p.kind === 'bundle';
  const hostOpts = isB ? (((p.variants || []).find(v => v.id === vId) || {}).requires || p.requires || []) : [];
  const hostSel = (st.hostSel && hostOpts.includes(st.hostSel)) ? st.hostSel : hostOpts[0];
  const ups = (st.ups || []).map(id => byId(cat, id)).filter(Boolean);
  return `<div class="md">
   <div class="mdimg">${p.img ? `<img src="${esc(imgOf(p, true))}" width="1200" height="900" alt="${esc(p.name)}">` : `<span class="pic big">${icon(p.icon)}</span>`}</div>
   <div class="mdb">
    <div class="pk">${esc(isBundle ? 'Πακέτο' : catOf(cat, p.cat).name)}${p.badge ? `<span class="badge s">${esc(p.badge)}</span>` : ''}</div>
    <h2 id="mdT">${esc(p.name)}</h2>
    <p class="lead2">${esc(p.long || p.short)}</p>
    ${(p.variants || []).length > 1 ? `<div class="mdsec"><h4>${isB ? 'Τι θέλετε να περιλαμβάνει' : 'Διαλέξτε'}</h4><div class="opts">${p.variants.map(v => { const u = unitPrice(cat, p, v.id); return `<button type="button" class="opt${vId === v.id ? ' on' : ''}" data-pv="${esc(p.id)}" data-v="${esc(v.id)}"><span class="rd"></span><span class="ot">${esc(v.name)}</span><b>${u && u.price ? euro(u.price) : (isB ? 'Δωρεάν' : '0 €')}</b></button>`; }).join('')}</div></div>` : ''}
    ${hostOpts.length ? `<div class="mdsec"><h4>Φιλοξενία <span class="req">απαραίτητη</span></h4><div class="opts">${hostOpts.map(id => { const h = byId(cat, id); if (!h) return ''; return `<button type="button" class="opt${hostSel === id ? ' on' : ''}" data-hsel="${esc(id)}"><span class="rd"></span><span class="ot">${esc(h.name)}${h.badge ? ` <span class="badge s">${esc(h.badge)}</span>` : ''}<small>${esc(h.short)}</small></span><b>${euro(h.price)}<small>/ έτος</small></b></button>`; }).join('')}</div></div>` : ''}
    ${isBundle ? `<div class="mdsec"><h4>Περιλαμβάνει</h4>${bullets((p.includes || []).map(r => includesTxt(cat, r)).join('\n'))}</div>` : `<div class="mdsec"><h4>Τι περιλαμβάνει</h4>${bullets(p.desc)}</div>`}
    ${steps.length ? `<div class="mdsec"><h4>Πώς δουλεύει</h4><ol class="steps">${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}
    <div class="mdbuy"><div><div class="price">${priceTxt(cat, p, (p.variants || []).length > 1 ? vId : undefined)}</div>${p.priceNote ? `<div class="pnote">${esc(p.priceNote)}</div>` : ''}${hostOpts.length ? `<div class="pnote">+ ${esc((byId(cat, hostSel) || {}).name || '')} ${euro((byId(cat, hostSel) || {}).price || 0)} / έτος + ΦΠΑ</div>` : ''}</div>
     ${p.quote ? `<a class="add big" href="https://advonmedia.com/#contact">Ζητήστε προσφορά ${icon('arrow')}</a>` : `<button type="button" class="add big${inCart && !isB ? ' on' : ''}" data-buy="${esc(p.id)}">${inCart && !isB ? icon('check') + ' Στο καλάθι' : icon('cart') + ' Προσθήκη στο καλάθι'}</button>`}</div>
    ${ups.length ? `<div class="mdsec"><h4>Συχνά μαζί</h4><div class="upl">${ups.map(u => upRow(cat, u, st)).join('')}</div></div>` : ''}
   </div></div>`;
}
export function upRow(cat, p, st = {}) {
  const inCart = (st.ids || []).includes(p.id);
  return `<div class="up">${p.img ? `<img src="${esc(imgOf(p))}" width="96" height="72" alt="" loading="lazy">` : `<span class="pic sm">${icon(p.icon)}</span>`}<div class="upt"><b>${esc(p.name)}</b><div class="price">${priceTxt(cat, p)}</div></div><button type="button" class="add sm${inCart ? ' on' : ''}" ${p.kind === 'build' ? `data-open="${esc(p.id)}" data-step="buy"` : `data-add="${esc(p.id)}"`} aria-label="Προσθήκη: ${esc(p.name)}">${inCart ? icon('check') : icon('plus')}</button></div>`;
}

/* hero category tiles */
export function catTiles(cat) {
  const T = [['site', 'Ιστοσελίδα', 'Δωρεάν κατασκευή', '#istoselides'], ['eshop', 'E-shop', 'Δικό σας κατάστημα', '#eshop'], ['social', 'Social Media', 'από 49 € / μήνα', '#social'],
    ['meta', 'Meta Ads', 'Facebook & Instagram', '#diafimiseis'], ['ads', 'Google Ads', '1ος μήνας 0 €', '#diafimiseis'], ['b-grow', 'Πακέτα', 'σε καλύτερη τιμή', '#paketa']];
  return `<div class="tiles">${T.map(([id, n, s, href]) => { const p = byId(cat, id); return `<a class="ctile" href="${href}">${p && p.img ? `<img src="${esc(imgOf(p))}" width="600" height="450" alt="" loading="eager" decoding="async">` : ''}<span class="ct"><b>${esc(n)}</b><small>${esc(s)}</small></span></a>`; }).join('')}</div>`;
}
