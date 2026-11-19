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
const imgOf = (p, big) => p.img ? (big ? p.img : p.img.replace(/\.webp$/, '-450.webp')) : '';

export function fromPrice(cat, p, day = athensDay()) {
  if (p.variants && p.variants.length) {
    const all = p.variants.map(v => unitPrice(cat, p, v.id, day)).filter(Boolean);
    return { ...all.reduce((a, b) => (b.price < a.price ? b : a), all[0]), from: new Set(all.map(x => x.price)).size > 1 };
  }
  return { ...unitPrice(cat, p, null, day), from: false };
}
const UNIT_SHORT = { year: '/ έτος', month: '/ μήνα', request: '/ αίτημα', page: '/ σελίδα', once: '', piece: '' };
export const unitShort = u => UNIT_SHORT[u || 'once'] ?? '';
/* THE price shown everywhere: one big number, its unit, and one short line under it */
export function priceBlock(cat, p, vId, { big = false } = {}) {
  const u = vId ? unitPrice(cat, p, vId) : fromPrice(cat, p);
  if (!u) return '';
  const show = p.listPrice != null && u.price === 0 ? p.listPrice : u.price;
  const was = u.original > u.price ? u.original : (p.compareAt && p.compareAt > show ? p.compareAt : 0);
  const note = p.priceNote ? `<span class="pnote${/0 €|δωρεάν|δώρο/i.test(p.priceNote) ? ' g' : ''}">${esc(p.priceNote)}</span>` : '';
  return `<div class="price${big ? ' big' : ''}"><div class="pl">${was ? `<s>${euro(was)}</s>` : ''}<b class="pr">${euro(show)}</b><span class="pu">${esc(unitShort(p.unit))}${unitShort(p.unit) ? ' ' : ''}+ ΦΠΑ</span></div>${note}</div>`;
}
export function includesTxt(cat, ref) {
  const [id, v] = String(ref).split(':'), q = byId(cat, id); if (!q) return id;
  const vn = v && q.variants ? (q.variants.find(x => x.id === v) || {}).name : '';
  return q.name + (vn ? ' · ' + vn : '');
}

/* one product card — the same for every product in the shop */
export function card(cat, p, st = {}) {
  const ids = st.ids || [], inCart = ids.includes(p.id), vOf = st.vOf || {};
  const vId = p.variants && p.variants.length ? (vOf[p.id] || p.variants[0].id) : null;
  const img = imgOf(p);
  const chips = vId ? `<div class="vs" role="group" aria-label="Επιλογή">${p.variants.map(v => `<button type="button" class="vchip${v.id === vId ? ' on' : ''}" data-pv="${esc(p.id)}" data-v="${esc(v.id)}" aria-pressed="${v.id === vId}">${esc(v.name)}</button>`).join('')}</div>` : '';
  const vnote = vId ? (p.variants.find(v => v.id === vId) || {}).note : '';
  const btn = p.link ? `<a class="add" href="${esc(p.link)}">Συνέχεια ${icon('arrow')}</a>`
    : inCart ? `<button type="button" class="add on" data-add="${esc(p.id)}">${icon('check')} Στο καλάθι</button>`
    : `<button type="button" class="add" data-add="${esc(p.id)}">${icon('cart')} Στο καλάθι</button>`;
  return `<article class="pc${inCart ? ' in' : ''}" id="p-${esc(p.id)}">
   <button type="button" class="pimg" data-open="${esc(p.id)}" aria-label="${esc(p.name)} — λεπτομέρειες">${img ? `<img src="${esc(img)}" srcset="${esc(img)} 450w, ${esc(imgOf(p, true))} 900w" sizes="(max-width:700px) 50vw, 340px" width="450" height="450" alt="${esc(p.name)}" loading="lazy" decoding="async">` : ''}${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}</button>
   <div class="pb">
    <h3><button type="button" data-open="${esc(p.id)}">${esc(p.name)}</button></h3>
    <p class="ps">${esc(p.short || '')}</p>
    ${chips}${vnote ? `<p class="vnote">${esc(vnote)}</p>` : ''}
    <div class="pf">${priceBlock(cat, p, vId)}</div>
    <div class="pa">${btn}<button type="button" class="det" data-open="${esc(p.id)}">Λεπτομέρειες</button></div>
   </div></article>`;
}
export function grid(cat, catId, st) {
  const ps = inCat(cat, catId), n = ps.length;
  const cols = n % 4 === 0 ? 4 : n % 3 === 0 ? 3 : n <= 2 ? 2 : 4;
  return `<div class="pgrid c${cols}">${ps.map(p => card(cat, p, st)).join('')}</div>`;
}

/* the product window */
export function details(cat, p, st = {}) {
  const vOf = st.vOf || {}, ids = st.ids || [], inCart = ids.includes(p.id);
  const vId = p.variants && p.variants.length ? (vOf[p.id] || p.variants[0].id) : null;
  const opts = vId ? `<div class="mdsec"><h4>Διαλέξτε</h4><div class="opts">${p.variants.map(v => { const u = unitPrice(cat, p, v.id); return `<button type="button" class="opt${v.id === vId ? ' on' : ''}" data-pv="${esc(p.id)}" data-v="${esc(v.id)}"><span class="rd"></span><span class="ot">${esc(v.name)}${v.note ? `<small>${esc(v.note)}</small>` : ''}</span><b>${euro(u ? u.price : v.price)}<small>${esc(unitShort(p.unit))}</small></b></button>`; }).join('')}</div></div>` : '';
  const inc = p.kind === 'bundle' && p.includes && p.includes.length ? `<div class="mdsec"><h4>Περιλαμβάνει</h4>${bullets(p.includes.map(r => includesTxt(cat, r)).join('\n'))}</div>` : '';
  const what = p.desc ? `<div class="mdsec"><h4>Τι περιλαμβάνει</h4>${bullets(p.desc)}</div>` : '';
  const steps = p.steps ? `<div class="mdsec"><h4>Πώς δουλεύει</h4><ol class="steps">${lines(p.steps).map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>` : '';
  const ups = (st.ups || []).map(id => byId(cat, id)).filter(q => q && q.listed !== false && !ids.includes(q.id));
  const btn = p.link ? `<a class="add big" href="${esc(p.link)}">Συνέχεια στην ανανέωση ${icon('arrow')}</a>`
    : inCart ? `<button type="button" class="add big on" data-buy="${esc(p.id)}">${icon('check')} Στο καλάθι — δείτε το καλάθι</button>`
    : `<button type="button" class="add big" data-buy="${esc(p.id)}">${icon('cart')} Προσθήκη στο καλάθι</button>`;
  return `<div class="md"><div class="mdimg">${p.img ? `<img src="${esc(imgOf(p, true))}" width="900" height="900" alt="${esc(p.name)}">` : ''}</div>
   <div class="mdb">${p.badge ? `<span class="badge s">${esc(p.badge)}</span>` : ''}<h2 id="mdTitle">${esc(p.name)}</h2>
    ${priceBlock(cat, p, vId, { big: true })}
    <p class="lead2">${esc(p.long || p.short || '')}</p>
    ${opts}<div class="mdbuy">${btn}</div>${inc}${what}${steps}
    ${ups.length ? `<div class="mdsec"><h4>Ταιριάζει μαζί</h4><div class="upl">${ups.slice(0, 3).map(q => upRow(cat, q, st)).join('')}</div></div>` : ''}
   </div></div>`;
}
/* a small row used in the cart and the window */
export function upRow(cat, p, st = {}) {
  const img = imgOf(p);
  return `<div class="up">${img ? `<img src="${esc(img)}" width="72" height="72" alt="" loading="lazy">` : ''}<div class="upt"><b>${esc(p.name)}</b>${priceBlock(cat, p, null)}</div>
   <button type="button" class="add sm" data-add="${esc(p.id)}" aria-label="Προσθήκη: ${esc(p.name)}">${icon('plus')}</button></div>`;
}
