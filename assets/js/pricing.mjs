/*  Advon Shop — pricing.mjs
    ONE place where every price is calculated.
    The page uses it to SHOW the cart, the server uses the very same file to
    CHARGE the cart. The browser's numbers are never trusted: the server takes
    only "which product, which variant, how many" and recalculates everything
    here from the catalogue it keeps itself.
    All money is in cents (whole numbers) so 0,1 + 0,2 problems never happen. */

export const UNITS = {
  once: { el: 'εφάπαξ', en: 'one-off' },
  year: { el: '/ έτος', en: '/ year' },
  month: { el: '/ μήνα', en: '/ month' },
  request: { el: '/ αίτημα', en: '/ request' },
  page: { el: '/ σελίδα', en: '/ page' },
  piece: { el: '', en: '' }
};

/* «YYYY-MM-DD» in Athens time, so a sale «until 30/11» ends at midnight in Greece */
export function athensDay(now = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Athens', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  } catch (e) { return now.toISOString().slice(0, 10); }
}

const inRange = (day, from, to) => (!from || day >= from) && (!to || day <= to);

export function euro(cents, opts = {}) {
  const v = (cents || 0) / 100;
  const s = v.toLocaleString('el-GR', { minimumFractionDigits: v % 1 ? 2 : (opts.always2 ? 2 : 0), maximumFractionDigits: 2 });
  return s + ' €';
}

/* the base price of a product or of one of its variants, before any discount */
export function basePrice(product, variantId) {
  if (product.variants && product.variants.length) {
    const v = product.variants.find(x => x.id === variantId) || null;
    return v ? { price: v.price, variant: v } : null;
  }
  return { price: product.price, variant: null };
}

/* the best price today for one unit: product sale or category sale, whichever is lower */
export function unitPrice(catalog, product, variantId, day = athensDay()) {
  const b = basePrice(product, variantId);
  if (!b) return null;
  let price = b.price, reason = null;
  const sale = product.sale;
  if (sale && sale.active !== false && inRange(day, sale.from, sale.to)) {
    let p = price;
    if (sale.pct) p = Math.round(price * (100 - sale.pct) / 100);
    else if (b.variant && b.variant.salePrice != null) p = b.variant.salePrice;
    else if (sale.price != null && !b.variant) p = sale.price;
    if (p < price) { price = p; reason = sale.label || 'Προσφορά'; }
  }
  for (const cs of (catalog.catSales || [])) {
    if (!cs || cs.active === false || cs.cat !== product.cat || !inRange(day, cs.from, cs.to)) continue;
    const p = Math.round(b.price * (100 - (cs.pct || 0)) / 100);
    if (p < price) { price = p; reason = cs.label || ('-' + cs.pct + '%'); }
  }
  return { price, original: b.price, reason, variant: b.variant };
}

/* VAT of one line. If prices are written WITH VAT (retail shops) we take the VAT out,
   if they are written WITHOUT VAT (Advon: «130 € + ΦΠΑ») we add it on top. */
function splitVat(amount, rate, inclusive) {
  if (inclusive) {
    const net = Math.round(amount * 100 / (100 + rate));
    return { net, vat: amount - net, gross: amount };
  }
  const vat = Math.round(amount * rate / 100);
  return { net: amount, vat, gross: amount + vat };
}

/* items = [{id, v (variant id), qty, note}] — the ONLY thing taken from the visitor */
export function priceCart(catalog, items, couponCode, opts = {}) {
  const day = opts.day || athensDay();
  const s = catalog.settings || {};
  const inclusive = !!s.pricesIncludeVat;
  const errors = [];
  const lines = [];
  const byId = new Map((catalog.products || []).map(p => [p.id, p]));

  for (const it of (Array.isArray(items) ? items : []).slice(0, 60)) {
    const p = byId.get(String(it && it.id || ''));
    if (!p || p.active === false) { errors.push('Το προϊόν δεν υπάρχει πια: ' + (it && it.id)); continue; }
    if (p.quote) { errors.push('Για «' + p.name + '» ζητήστε προσφορά.'); continue; }
    const max = Math.max(1, Math.min(999, p.maxQty || 10));
    const qty = Math.floor(Number(it.qty));
    if (!(qty >= 1)) { errors.push('Λάθος ποσότητα: ' + p.name); continue; }
    if (qty > max) { errors.push('Μέγιστη ποσότητα ' + max + ': ' + p.name); continue; }
    if (Number.isFinite(p.stock) && qty > p.stock) { errors.push(p.stock > 0 ? 'Διαθέσιμα μόνο ' + p.stock + ': ' + p.name : 'Εξαντλήθηκε: ' + p.name); continue; }
    const u = unitPrice(catalog, p, it.v || null, day);
    if (!u) { errors.push('Διαλέξτε επιλογή για: ' + p.name); continue; }
    const note = (p.ask || p.needsSite) ? String(it.note || '').slice(0, 240).trim() : '';
    if (p.ask && p.askRequired && !note) { errors.push('Συμπληρώστε: ' + p.ask); continue; }
    lines.push({
      id: p.id, sku: p.sku || p.id, name: p.name, v: u.variant ? u.variant.id : null,
      vname: u.variant ? u.variant.name : null, qty, unit: p.unit || 'once',
      unitPrice: u.price, unitOriginal: u.original, saleReason: u.reason,
      vatRate: Number.isFinite(p.vat) ? p.vat : (catalog.vatDefault ?? 24),
      amount: u.price * qty, cat: p.cat, note, ask: p.ask || null, priceNote: p.priceNote || null,
      _req: (u.variant && u.variant.requires && u.variant.requires.length ? u.variant.requires : p.requires) || null, _site: !!p.needsSite, _kind: p.kind || null, _not: p.notWith || null
    });
  }

  /* what goes together: a website needs its hosting, add-ons need a website (new or existing) */
  const ids = new Set(lines.map(l => l.id));
  const name = id => (byId.get(id) || {}).name || id;
  const hasBuild = lines.some(l => l._kind === 'build');
  for (const l of lines) {
    if (l._req && l._req.length && !l._req.some(id => ids.has(id))) errors.push('Για «' + l.name + '» χρειάζεται επίσης: ' + l._req.map(name).join(' ή ') + '.');
    if (l._site && !hasBuild && !l.note) errors.push('«' + l.name + '»: γράψτε για ποια ιστοσελίδα είναι (π.χ. onoma.gr).');
    if (l._not && l._not.some(id => ids.has(id))) errors.push('«' + l.name + '»: περιλαμβάνεται ήδη στο ' + l._not.filter(id => ids.has(id)).map(name).join(', ') + '.');
    if (l._kind === 'hosting' && !lines.some(b => b._kind === 'build')) errors.push('Η φιλοξενία μπαίνει μαζί με μια ιστοσελίδα. Για ανανέωση, δείτε τη σελίδα «Ανανέωση».');
  }
  if (lines.filter(l => l._kind === 'build').length > 1) errors.push('Διαλέξτε ένα από: ιστοσελίδα, e-shop ή κατάλυμα ανά παραγγελία.');
  if (lines.filter(l => l._kind === 'hosting').length > 1) errors.push('Διαλέξτε μία φιλοξενία.');
  for (const l of lines) { delete l._req; delete l._site; delete l._kind; delete l._not; }

  /* coupon */
  let coupon = null, discount = 0;
  const code = String(couponCode || '').trim().toUpperCase();
  if (code) {
    const c = (catalog.coupons || []).find(x => String(x.code || '').toUpperCase() === code);
    const base = lines.filter(l => !c || !c.cats || !c.cats.length || c.cats.includes(l.cat));
    const baseSum = base.reduce((a, l) => a + l.amount, 0);
    if (!c || c.active === false) errors.push('Ο κωδικός δεν ισχύει.');
    else if (!inRange(day, c.from, c.to)) errors.push('Ο κωδικός έχει λήξει ή δεν ισχύει ακόμα.');
    else if (c.maxUses && (c.uses || 0) >= c.maxUses) errors.push('Ο κωδικός έχει χρησιμοποιηθεί όσες φορές επιτρέπεται.');
    else if (c.min && baseSum < c.min) errors.push('Ο κωδικός ισχύει για παραγγελίες από ' + euro(c.min) + '.');
    else if (!baseSum) errors.push('Ο κωδικός δεν αφορά τα προϊόντα του καλαθιού.');
    else {
      discount = c.type === 'fixed' ? Math.min(c.value || 0, baseSum) : Math.round(baseSum * Math.min(100, c.value || 0) / 100);
      coupon = { code: c.code, type: c.type, value: c.value, label: c.label || null };
      /* spread the discount over the lines it applies to, so each line's VAT stays right */
      let left = discount;
      base.forEach((l, i) => {
        const share = i === base.length - 1 ? left : Math.round(discount * l.amount / baseSum);
        l.discount = Math.min(share, l.amount); left -= l.discount;
      });
    }
  }

  let net = 0, vat = 0, gross = 0;
  for (const l of lines) {
    const after = l.amount - (l.discount || 0);
    const t = splitVat(after, l.vatRate, inclusive);
    Object.assign(l, { net: t.net, vat: t.vat, gross: t.gross });
    net += t.net; vat += t.vat; gross += t.gross;
  }

  /* shipping (off for Advon — services) */
  let shipping = 0;
  const sh = s.shipping || {};
  if (sh.enabled && lines.length) {
    if (!(sh.freeOver && gross >= sh.freeOver)) shipping = sh.flat || 0;
    gross += shipping;
  }

  return {
    lines, coupon, discount, shipping, net, vat, total: gross,
    inclusive, errors, day, currency: 'EUR'
  };
}

/* a short readable version of the cart for e-mails and the panel */
export function cartSummary(priced) {
  return priced.lines.map(l => `${l.qty} × ${l.name}${l.vname ? ' — ' + l.vname : ''}${l.note ? ' («' + l.note + '»)' : ''}: ${euro(l.gross, { always2: true })}`).join('\n');
}
