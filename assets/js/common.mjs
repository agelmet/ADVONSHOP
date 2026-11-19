/* Advon Shop — where the page gets its data.
   LIVE (on the shop's own domain): from the server functions (/api/...).
   DEMO (the draft on drafts.advonmedia.com): everything stays in this browser, nothing is charged. */
import { priceCart } from './pricing.mjs';

const host = location.hostname;
export const DEMO = /github\.io$|^drafts\.advonmedia\.com$|^localhost$|^127\.0\.0\.1$/.test(host) && !/[?&]live=1/.test(location.search) || location.protocol === 'file:' || /[?&]demo=1/.test(location.search);

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
export { LS };

export const DEMO_CAT = 'advon-shop:demo-catalog';
export const DEMO_ORDERS = 'advon-shop:demo-orders';
const CART = 'advon-shop:cart';

let fullDemo = null;
export async function demoCatalog() {
  if (fullDemo) return fullDemo;
  let base = null;
  try { const r = await fetch('data/catalog.json', { cache: 'no-store' }); if (r.ok) base = await r.json(); } catch (e) {}
  if (!base) base = JSON.parse(document.getElementById('seed').textContent);
  const own = LS.get(DEMO_CAT, null);
  /* a demo catalogue saved from an older shop layout is dropped (its settings and coupons are kept) */
  if (own && own.products && (own.schema || 1) === (base.schema || 1)) return (fullDemo = own);
  if (own && own.products) { base.settings = { ...base.settings, ...(own.settings || {}) }; base.coupons = own.coupons || base.coupons; LS.set(DEMO_CAT, base); }
  return (fullDemo = base);
}
export function resetDemoCache() { fullDemo = null; }

export async function loadCatalog() {
  if (DEMO) {
    const c = JSON.parse(JSON.stringify(await demoCatalog()));
    c.pay = { stripe: true, viva: true, bank: !!(c.settings.bank && c.settings.bank.iban) };
    const p = c.settings.payments || {};
    for (const k of ['stripe', 'viva', 'bank']) if (p[k] === false) c.pay[k] = false;
    c.demo = true; return c;
  }
  const r = await fetch('/api/catalog', { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error('catalog ' + r.status);
  return r.json();
}

/* the cart: only ids, variants, quantities and notes — never prices */
export const cart = {
  items() { return LS.get(CART, []).filter(x => x && x.id); },
  save(items) { LS.set(CART, items); dispatchEvent(new CustomEvent('cart')); },
  add(it) {
    const items = this.items();
    const same = items.find(x => x.id === it.id && (x.v || null) === (it.v || null) && (x.note || '') === (it.note || ''));
    if (same) same.qty += it.qty || 1; else items.push({ id: it.id, v: it.v || null, qty: it.qty || 1, note: it.note || '' });
    this.save(items);
  },
  set(i, qty) { const items = this.items(); if (!items[i]) return; if (qty <= 0) items.splice(i, 1); else items[i].qty = qty; this.save(items); },
  clear() { this.save([]); },
  count() { return this.items().reduce((a, x) => a + (x.qty || 0), 0); }
};

export async function quote(items, coupon) {
  if (DEMO) return priceCart(await demoCatalog(), items, coupon);
  const r = await fetch('/api/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ items, coupon }) });
  const d = await r.json(); if (!d.ok) throw new Error(d.error || 'quote'); return d.priced;
}

export async function checkout(payload) {
  if (!DEMO) {
    const r = await fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    return r.json();
  }
  /* DEMO: the same checks the server does, then a pretend payment */
  const cat = await demoCatalog();
  const priced = priceCart(cat, payload.items, payload.coupon);
  if (priced.errors.length) return { ok: false, error: priced.errors.join(' '), priced };
  if (payload.expectTotal != null && payload.expectTotal !== priced.total) return { ok: false, error: 'Οι τιμές άλλαξαν — ελέγξτε το νέο σύνολο.', priced };
  const id = 'A' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Array.from(crypto.getRandomValues(new Uint8Array(4)), x => 'BCDFGHJKLMNPQRSTVWXZ23456789'[x % 28]).join('');
  const order = {
    id, token: 'demo', createdAt: new Date().toISOString(), method: payload.method, customer: payload.customer, priced,
    status: payload.method === 'bank' ? 'awaiting_transfer' : 'pending', provider: {}, demo: true,
    history: [{ at: new Date().toISOString(), what: 'Δημιουργήθηκε (δοκιμή)' }]
  };
  const all = LS.get(DEMO_ORDERS, []); all.unshift(order); LS.set(DEMO_ORDERS, all.slice(0, 200));
  return { ok: true, url: 'order.html?demo=' + id };
}

export function demoOrders() { return LS.get(DEMO_ORDERS, []); }
export function saveDemoOrders(a) { LS.set(DEMO_ORDERS, a); }

export async function getOrder(params) {
  if (DEMO || params.get('demo')) {
    const id = params.get('demo') || params.get('o');
    const o = demoOrders().find(x => x.id === id);
    return o ? { ok: true, ...o, name: (o.customer.name || '').split(' ')[0], bank: (await demoCatalog()).settings.bank } : { ok: false, error: 'Δεν βρέθηκε η παραγγελία.' };
  }
  const r = await fetch('/api/order?' + params.toString());
  return r.json();
}

/* demo «payment»: mark paid (same rules as the server: amount must match) */
export async function demoPay(id, ok) {
  const all = demoOrders(); const o = all.find(x => x.id === id); if (!o) return;
  if (ok) {
    o.status = 'paid'; o.paidAt = new Date().toISOString(); o.history.push({ at: o.paidAt, what: 'Πληρώθηκε — ' + (o.method === 'viva' ? 'Viva' : 'Stripe') + ' (δοκιμή)' });
    const cat = await demoCatalog();
    if (o.priced.coupon) { const c = (cat.coupons || []).find(x => x.code === o.priced.coupon.code); if (c) c.uses = (c.uses || 0) + 1; LS.set(DEMO_CAT, cat); }
  } else { o.status = 'failed'; o.history.push({ at: new Date().toISOString(), what: 'Η πληρωμή ακυρώθηκε (δοκιμή)' }); }
  saveDemoOrders(all);
}
