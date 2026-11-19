/* Advon Shop — HTML pieces of the shop. Used by the page AND by the build (so Google sees the real services). */
import { unitPrice, UNITS, euro, athensDay } from './pricing.mjs';

export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const ICONS = {
  site: '<path d="M3 5h18v14H3z"/><path d="M3 9h18M7 7h.01M10 7h.01"/>',
  shop: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  stay: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  mail: '<path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h8"/>',
  social: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><path d="M17 7h.01"/>',
  ads: '<path d="M4 15V9l11-5v16L4 15z"/><path d="M15 9a3 3 0 0 1 0 6M7 15l1.5 5h3L10 15.5"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M8 14h3"/>',
  ai: '<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z"/>',
  edit: '<path d="M4 20h16"/><path d="M6 16l9-9 3 3-9 9H6z"/>',
  qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
};
export const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.plus}</svg>`;

export function bullets(text) {
  const lines = String(text || '').split('\n').map(s => s.trim()).filter(Boolean);
  const li = lines.filter(l => /^[•\-*]\s?/.test(l)).map(l => `<li>${icon('check')}<span>${esc(l.replace(/^[•\-*]\s?/, ''))}</span></li>`).join('');
  const ps = lines.filter(l => !/^[•\-*]\s?/.test(l)).map(l => `<p>${esc(l)}</p>`).join('');
  return ps + (li ? `<ul class="ticks">${li}</ul>` : '');
}

export const unitEl = u => (UNITS[u || 'once'] || UNITS.once).el;
export const vatPlus = (cat) => cat.settings && cat.settings.pricesIncludeVat ? '' : ' + ΦΠΑ';
const listed = cat => (cat.products || []).filter(p => p.active !== false && p.listed !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const inCat = (cat, id) => listed(cat).filter(p => p.cat === id);
const catOf = (cat, id) => (cat.categories || []).find(c => c.id === id) || { name: '', desc: '' };

/* lowest price today (for «από X €») */
export function fromPrice(cat, p, day = athensDay()) {
  if (p.variants && p.variants.length) {
    const all = p.variants.map(v => unitPrice(cat, p, v.id, day)).filter(Boolean);
    return { ...all.reduce((a, b) => (b.price < a.price ? b : a), all[0]), from: new Set(all.map(x => x.price)).size > 1 };
  }
  return { ...unitPrice(cat, p, null, day), from: false };
}
export function priceTxt(cat, p, vId, opts = {}) {
  const u = vId !== undefined ? unitPrice(cat, p, vId) : fromPrice(cat, p);
  if (!u || u.price == null) return '';
  if (u.price === 0 && p.kind === 'build') return '<b class="pr">Δωρεάν</b>';
  const was = u.original > u.price ? `<s>${euro(u.original)}</s> ` : '';
  return `${u.from ? '<small>από</small> ' : ''}${was}<b class="pr">${euro(u.price)}</b><small>${esc(unitEl(p.unit))}${u.price ? vatPlus(cat) : ''}</small>`;
}

/* ---------- step 1: what we build ---------- */
const MOCK = {
  site: '<div class="mk mk-site"><i class="bar"></i><i class="av"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="btn"></i></div>',
  shop: '<div class="mk mk-shop"><i class="bar"></i><i class="p"></i><i class="p"></i><i class="p"></i><i class="l1"></i><i class="bag"></i></div>',
  stay: '<div class="mk mk-stay"><i class="bar"></i><i class="ph"></i><i class="cal">' + '<b></b>'.repeat(14) + '</i></div>'
};
export function buildStep(cat, st = {}) {
  const tiles = inCat(cat, 'build').map(p => {
    const on = st.build === p.id;
    const vs = (p.variants || []).map(v => `<button type="button" class="seg${on && st.buildV === v.id ? ' on' : ''}" data-bv="${esc(p.id)}" data-v="${esc(v.id)}"><span>${esc(v.name)}</span><b>${priceTxt(cat, p, v.id)}</b></button>`).join('');
    return `<article class="tile${on ? ' on' : ''}" data-build="${esc(p.id)}">
      <button type="button" class="tilebtn" data-pick="${esc(p.id)}" aria-pressed="${on}">
       ${MOCK[p.icon] || ''}<span class="tick">${icon('check')}</span>
       ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}
       <h3>${esc(p.name)}</h3><p>${esc(p.short)}</p>
       <div class="price">${priceTxt(cat, p)}</div>${p.priceNote ? `<div class="pnote">${esc(p.priceNote)}</div>` : ''}
      </button>
      ${vs ? `<div class="segs"${on ? '' : ' hidden'}>${vs}</div>` : ''}
      <details class="more"><summary>Τι περιλαμβάνει</summary>${bullets(p.desc)}</details>
      <button type="button" class="cardbtn${on ? ' on' : ''}" data-pick="${esc(p.id)}">${on ? icon('check') + ' Επιλέχθηκε' : 'Επιλογή'}</button>
    </article>`;
  }).join('');
  return `<div class="tiles">${tiles}</div>
   <button type="button" class="existing${st.existing ? ' on' : ''}" data-existing aria-pressed="${!!st.existing}">
    <span class="tick">${icon('check')}</span><span><b>Έχω ήδη ιστοσελίδα με την Advon</b><small>Θέλω μόνο προσθήκες ή προβολή για τη σελίδα μου</small></span></button>
   <div class="domainrow"${st.existing ? '' : ' hidden'}><label for="dom">Ποια είναι η ιστοσελίδα σας;</label><input id="dom" placeholder="π.χ. onoma-epaggelma.gr" value="${esc(st.domain || '')}" autocomplete="url" inputmode="url"></div>`;
}

/* ---------- step 2: hosting (required) ---------- */
export function hostingStep(cat, st = {}) {
  if (st.existing) return `<div class="note">${icon('check')}<div><b>Η σελίδα σας έχει ήδη φιλοξενία.</b> Για να την ανανεώσετε, πηγαίνετε στη σελίδα <a href="ananeosi.html">Ανανέωση φιλοξενίας</a>.</div></div>`;
  if (!st.build) return `<div class="note dim">${icon('lock')}<div>Διαλέξτε πρώτα τι θα φτιάξουμε στο βήμα 1 — η φιλοξενία μπαίνει αυτόματα.</div></div>`;
  const opts = st.hostOptions || [];
  return `<div class="hosts">${opts.map(id => {
    const p = (cat.products || []).find(x => x.id === id); if (!p) return '';
    const on = st.hosting === id;
    return `<button type="button" class="host${on ? ' on' : ''}" data-host="${esc(id)}" aria-pressed="${on}">
      <span class="tick">${icon('check')}</span><div class="hb"><div class="hh"><h3>${esc(p.name)}</h3>${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}</div>
      <p>${esc(p.short)}</p>${bullets(p.desc)}</div><div class="hfoot"><div class="price">${priceTxt(cat, p)}</div><span class="cardbtn${on ? ' on' : ''}">${on ? icon('check') + ' Επιλέχθηκε' : 'Επιλογή'}</span></div></button>`;
  }).join('')}</div>${opts.length === 1 ? '<p class="small">Για αυτή την επιλογή υπάρχει ένα πακέτο φιλοξενίας.</p>' : ''}`;
}

/* ---------- step 3: add-ons ---------- */
export function extrasStep(cat, st = {}) {
  const has = id => (st.ids || []).includes(id);
  const blocked = p => (p.notWith || []).filter(id => has(id));
  const rows = inCat(cat, 'extras').map((p, i) => {
    const on = has(p.id), b = blocked(p);
    return `<button type="button" class="xrow${on ? ' on' : ''}" data-x="${esc(p.id)}" ${b.length ? 'disabled' : ''} aria-pressed="${on}" style="--i:${i}">
      <span class="xmedia"><span class="xic">${icon(p.icon)}</span>${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}<span class="tick">${icon('check')}</span></span>
      <span class="xt"><b>${esc(p.name)}</b><small>${b.length ? 'Περιλαμβάνεται στο Growth' : esc(p.short)}</small></span>
      <span class="xfoot"><span class="price">${priceTxt(cat, p)}</span><span class="cardbtn${on ? ' on' : ''}">${b.length ? 'Περιλαμβάνεται' : on ? icon('check') + ' Στο πακέτο' : icon('plus') + ' Προσθήκη'}</span></span></button>`;
  }).join('');
  const monthly = inCat(cat, 'grow').map(p => {
    const on = has(p.id), cur = (st.vOf || {})[p.id] || (p.variants && p.variants[0] && p.variants[0].id);
    return `<article class="mcard${on ? ' on' : ''}" data-m="${esc(p.id)}">
      <div class="mtop"><span class="xic">${icon(p.icon)}</span><div><h3>${esc(p.name)}</h3><p>${esc(p.short)}</p></div></div>
      ${p.variants && p.variants.length ? `<div class="msegs">${p.variants.map(v => `<button type="button" class="mseg${cur === v.id ? ' on' : ''}" data-mv="${esc(p.id)}" data-v="${esc(v.id)}">${esc(v.name)}<b>${euro(unitPrice(cat, p, v.id).price)}</b></button>`).join('')}</div>` : ''}
      ${bullets(p.desc)}
      <div class="mfoot"><div><div class="price">${priceTxt(cat, p, p.variants && p.variants.length ? cur : null)}</div>${p.priceNote ? `<div class="pnote">${esc(p.priceNote)}</div>` : ''}</div>
      </div><button type="button" class="cardbtn${on ? ' on' : ''}" data-mt="${esc(p.id)}">${on ? icon('check') + ' Στο πακέτο' : icon('plus') + ' Προσθήκη'}</button></article>`;
  }).join('');
  return `<h3 class="subh">Με μία πληρωμή</h3><div class="xrows">${rows}</div>
   <h3 class="subh">${esc(catOf(cat, 'grow').name)}</h3><p class="small" style="margin-top:-6px">${esc(catOf(cat, 'grow').desc)}</p><div class="mcards">${monthly}</div>`;
}

/* ---------- existing clients + more solutions ---------- */
export function clientsBlock(cat) {
  const ch = (cat.products || []).find(p => p.id === 'changes' && p.active !== false);
  return `<div class="cgrid">
   ${ch ? `<div class="ccard" data-chg><span class="xic">${icon('edit')}</span><h3>${esc(ch.name)}</h3><p>${esc(ch.short)}</p>
     <div class="price">${priceTxt(cat, ch)}</div>
     <label class="fl"><span>Ποια ιστοσελίδα;</span><input id="chgDom" placeholder="π.χ. onoma.gr" inputmode="url"></label>
     <button type="button" class="btn primary" data-chgadd>${icon('plus')} Στο πακέτο</button></div>` : ''}
   <a class="ccard link" href="ananeosi.html"><span class="xic">${icon('cal')}</span><h3>Ανανέωση φιλοξενίας</h3><p>Ανανεώστε τη φιλοξενία της σελίδας σας για έναν ακόμα χρόνο — σε ένα λεπτό.</p><span class="go">Ανανέωση ${icon('arrow')}</span></a>
   <a class="ccard link" href="#vima-1" data-goexisting><span class="xic">${icon('plus')}</span><h3>Προσθήκες για τη σελίδα σας</h3><p>Φόρμα, άρθρα, πίνακας διαχείρισης, social media, Google Ads — για την ιστοσελίδα που ήδη έχετε.</p><span class="go">Διαλέξτε ${icon('arrow')}</span></a>
  </div>`;
}
export function moreBlock(cat) {
  return `<div class="mlist">${inCat(cat, 'more').map((p, i) => `<div class="mrow" style="--i:${i}"><span class="xmedia"><span class="xic">${icon(p.icon)}</span></span>
    <div class="mt"><h3>${esc(p.name)}</h3><p>${esc(p.short)}</p></div>
    <div class="xfoot">${p.quote ? `<span class="price"><b class="pr sm">Κατά παραγγελία</b></span><a class="cardbtn" href="https://advonmedia.com/#contact">Προσφορά ${icon('arrow')}</a>` : `<span class="price">${priceTxt(cat, p)}</span><button type="button" class="cardbtn" data-solo="${esc(p.id)}">${icon('plus')} Προσθήκη</button>`}</div></div>`).join('')}</div>`;
}
