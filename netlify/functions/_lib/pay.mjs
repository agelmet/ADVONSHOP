/* Advon Shop — talking to Stripe and Viva (plain fetch, no SDK, nothing loaded in the visitor's browser).
   The visitor is SENT to the payment company's own page; card numbers never touch our site. */
import { env, hmacHex, safeEqual, euro, store } from './core.mjs';
import { extrasOf } from '../../../assets/js/pricing.mjs';

/* ================= STRIPE ================= */
function form(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out);
    else out.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));
  }
  return out.join('&');
}

async function stripe(path, method = 'GET', params) {
  const r = await fetch('https://api.stripe.com/v1/' + path, {
    method,
    headers: { authorization: 'Bearer ' + env('STRIPE_SECRET_KEY'), 'content-type': 'application/x-www-form-urlencoded', 'Stripe-Version': '2024-06-20' },
    body: params ? form(params) : undefined
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('Stripe: ' + ((d.error && d.error.message) || r.status));
  return d;
}

/* ---------- the shop's products, mirrored in the payment company's own product catalogue ----------
   Same id in test and live: advon_<product>[_<option>]. The price charged is ALWAYS the one the server
   calculates (price_data); the catalogue copy only gives tidy reports per product, pictures on the
   payment page and ready prices for invoices or payment links. */
export const stripeMode = () => /_live_/.test(env('STRIPE_SECRET_KEY')) ? 'live' : 'test';
const mapKey = () => 'stripe/products-' + stripeMode() + '.json';
export const stripePid = (pid, vid) => ('advon_' + pid + (vid ? '_' + vid : '')).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 60);
export async function stripeProductMap(s = store()) { return (await s.get(mapKey(), { type: 'json' }).catch(() => null)) || { ids: {} }; }

const UNIT_TXT = { month: 'ανά μήνα', year: 'ανά έτος', request: 'ανά αίτημα', once: 'εφάπαξ' };
export function stripeCatalogItems(cat) {
  const out = [];
  for (const p of cat.products || []) {
    if (p.active === false) continue;
    const vat = Number.isFinite(p.vat) ? p.vat : (cat.vatDefault ?? 24);
    const opts = (p.variants && p.variants.length) ? p.variants.map(v => ({ v, price: v.price })) : [{ v: null, price: p.listPrice || p.price }];
    const g = c => cat.settings && cat.settings.pricesIncludeVat ? c : c + Math.round(c * vat / 100);
    const seenX = new Set();
    for (const { v, price } of opts) {
      /* setup fees / extra monthly charges → their own products (advon_<id>[_<option>]_<extra>) */
      for (const e of extrasOf(p, v)) {
        const own = v && Array.isArray(v.extras) && v.extras.length;
        const xid = stripePid(p.id, (own ? v.id + '_' : '') + e.id);
        if (seenX.has(xid)) continue; seenX.add(xid);
        out.push({ id: xid, shop: p.id, variant: (own ? v.id + ':' : '') + e.id, unit: e.unit || 'once', gross: g(e.price),
          name: e.name + ' — ' + p.name + (own ? ' (' + v.name + ')' : ''), description: undefined,
          img: p.img ? String(p.img).replace(/\.webp$/, '.jpg') : '' });
      }
      if (!price || price <= 0) continue;
      const gross = g(price);
      out.push({
        id: stripePid(p.id, v && v.id), shop: p.id, variant: v ? v.id : '', unit: p.unit || 'once', gross,
        name: p.name + (v ? ' — ' + v.name : ''),
        description: [p.short, v && v.note].filter(Boolean).join(' · ').slice(0, 300) || undefined,
        img: p.img ? String(p.img).replace(/\.webp$/, '.jpg') : ''
      });
    }
  }
  return out;
}

/* sync a few products per call (the panel calls again until done) */
export async function stripeSync(cat, base, from = 0, n = 5, s = store()) {
  const items = stripeCatalogItems(cat), map = await stripeProductMap(s);
  const part = items.slice(from, from + n), log = [];
  for (const it of part) {
    const fields = {
      name: it.name, description: it.description || '', active: 'true',
      metadata: { shop_product: it.shop, shop_option: it.variant || '-', unit: it.unit },
      url: base + '/'
    };
    if (it.img) fields.images = { 0: base + '/' + it.img };
    let prod;
    try { prod = await stripe('products/' + it.id); }
    catch (e) { if (!/No such product/i.test(e.message)) throw e; }
    if (prod) prod = await stripe('products/' + it.id, 'POST', fields);
    else prod = await stripe('products', 'POST', { id: it.id, ...fields });
    /* price: keep the current one if it already matches, otherwise add a new one and retire the old */
    const want = { amount: it.gross, interval: it.unit === 'month' ? 'month' : it.unit === 'year' ? 'year' : null };
    let price = null;
    if (prod.default_price) {
      const cur = await stripe('prices/' + (typeof prod.default_price === 'string' ? prod.default_price : prod.default_price.id));
      const iv = cur.recurring ? cur.recurring.interval : null;
      if (cur.active && cur.unit_amount === want.amount && iv === want.interval && cur.currency === 'eur') price = cur;
    }
    let state = 'ίδιο';
    if (!price) {
      const pp = { product: it.id, currency: 'eur', unit_amount: want.amount, nickname: UNIT_TXT[it.unit] + ' · με ΦΠΑ', lookup_key: it.id, transfer_lookup_key: 'true', metadata: { shop_product: it.shop, shop_option: it.variant || '-' } };
      if (want.interval) pp.recurring = { interval: want.interval };
      price = await stripe('prices', 'POST', pp);
      const old = prod.default_price && (typeof prod.default_price === 'string' ? prod.default_price : prod.default_price.id);
      await stripe('products/' + it.id, 'POST', { default_price: price.id });
      if (old && old !== price.id) await stripe('prices/' + old, 'POST', { active: 'false' }).catch(() => {});
      state = prod.created && Date.now() / 1000 - prod.created < 120 ? 'νέο' : 'νέα τιμή';
    }
    map.ids[it.id] = price.id;
    log.push({ id: it.id, name: it.name, price: euro(it.gross, { always2: true }), state });
  }
  /* products that left the shop are switched off (never deleted) */
  const next = from + part.length, done = next >= items.length;
  if (done) {
    const keep = new Set(items.map(i => i.id));
    for (const id of Object.keys(map.ids)) if (!keep.has(id)) {
      await stripe('products/' + id, 'POST', { active: 'false' }).catch(() => {});
      delete map.ids[id]; log.push({ id, name: id, state: 'απενεργοποιήθηκε' });
    }
    map.at = new Date().toISOString();
  }
  await s.setJSON(mapKey(), map);
  return { next, done, total: items.length, mode: stripeMode(), log };
}

/* one Stripe line per cart line, at the price the SERVER calculated (incl. VAT) */
export async function stripeCheckout(order, base, urls = null) {   // urls = {success, cancel} for pages outside the shop (advonmedia.com/ksekinima)
  const pr = order.priced;
  const line_items = {};
  const map = await stripeProductMap().catch(() => ({ ids: {} }));
  pr.lines.forEach((l, i) => {
    const pid = l.extra ? stripePid(l.id, (l.xv ? l.v + '_' : '') + l.extra) : stripePid(l.id, l.v);
    const linked = map.ids[pid] && l.gross % l.qty === 0;   // product exists in the payment catalogue → reports per product
    line_items[i] = linked
      ? { quantity: l.qty, price_data: { currency: 'eur', unit_amount: l.gross / l.qty, product: pid } }
      : { quantity: 1, price_data: { currency: 'eur', unit_amount: l.gross,
          product_data: { name: (l.qty > 1 ? l.qty + ' × ' : '') + l.name + (l.vname ? ' — ' + l.vname : ''), description: l.note ? l.note.slice(0, 200) : undefined } } };
  });
  if (pr.shipping) line_items[pr.lines.length] = { quantity: 1, price_data: { currency: 'eur', unit_amount: pr.shipping, product_data: { name: 'Μεταφορικά' } } };
  const s = await stripe('checkout/sessions', 'POST', {
    mode: 'payment',
    locale: 'el',
    client_reference_id: order.id,
    customer_email: order.customer.email,
    line_items,
    metadata: { order: order.id },
    payment_intent_data: { description: 'Παραγγελία ' + order.id, metadata: { order: order.id } },
    success_url: urls ? urls.success : `${base}/order.html?o=${order.id}&k=${order.token}&sid={CHECKOUT_SESSION_ID}`,
    cancel_url: urls ? urls.cancel : `${base}/?cancel=${order.id}#cart`,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60
  });
  return { url: s.url, ref: s.id };
}

export const stripeSession = id => stripe('checkout/sessions/' + encodeURIComponent(id));

/* Stripe signs every webhook: we recompute the signature with our secret and refuse anything that doesn't match */
export async function stripeVerify(raw, header) {
  const secret = env('STRIPE_WEBHOOK_SECRET');
  if (!secret || !header) return null;
  const parts = Object.fromEntries(String(header).split(',').map(x => x.split('=')).filter(x => x.length === 2).map(([k, v]) => [k.trim(), v.trim()]));
  const all = String(header).split(',').filter(x => x.trim().startsWith('v1=')).map(x => x.trim().slice(3));
  if (!parts.t || !all.length) return null;
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 600) return null; // older than 10 minutes = replay
  const want = await hmacHex(secret, parts.t + '.' + raw);
  if (!all.some(s => safeEqual(s, want))) return null;
  return JSON.parse(raw);
}

/* ================= VIVA ================= */
const live = () => env('VIVA_ENV', 'demo') === 'live';
const V = () => live()
  ? { accounts: 'https://accounts.vivapayments.com', api: 'https://api.vivapayments.com', basic: 'https://www.vivapayments.com', checkout: 'https://www.vivapayments.com/web/checkout' }
  : { accounts: 'https://demo-accounts.vivapayments.com', api: 'https://demo-api.vivapayments.com', basic: 'https://demo.vivapayments.com', checkout: 'https://demo.vivapayments.com/web/checkout' };

let tokenCache = { t: null, exp: 0 };
async function vivaToken() {
  if (tokenCache.t && tokenCache.exp > Date.now() + 60e3) return tokenCache.t;
  const r = await fetch(V().accounts + '/connect/token', {
    method: 'POST',
    headers: { authorization: 'Basic ' + btoa(env('VIVA_CLIENT_ID') + ':' + env('VIVA_CLIENT_SECRET')), 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error('Viva login: ' + r.status);
  tokenCache = { t: d.access_token, exp: Date.now() + (d.expires_in || 3600) * 1000 };
  return d.access_token;
}

export async function vivaCheckout(order) {
  const c = order.customer;
  const r = await fetch(V().api + '/checkout/v2/orders', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + await vivaToken(), 'content-type': 'application/json' },
    body: JSON.stringify({
      amount: order.priced.total,                  // in cents
      customerTrns: 'Παραγγελία ' + order.id,      // what the customer sees
      customer: { email: c.email, fullName: c.name, phone: c.phone, countryCode: 'GR', requestLang: 'el-GR' },
      paymentTimeout: 1800,
      sourceCode: env('VIVA_SOURCE_CODE'),
      merchantTrns: order.id,                      // our order number, comes back to us
      tags: ['advon-shop']
    })
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.orderCode) throw new Error('Viva order: ' + r.status + ' ' + JSON.stringify(d).slice(0, 200));
  const code = String(d.orderCode);
  return { url: V().checkout + '?ref=' + code, ref: code };
}

/* we never believe a «paid» message by itself: we ask Viva directly about that transaction */
export async function vivaTransaction(txId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(txId || ''))) return null;
  const r = await fetch(V().api + '/checkout/v2/transactions/' + txId, { headers: { authorization: 'Bearer ' + await vivaToken() } });
  if (!r.ok) return null;
  return r.json();
}

/* Viva checks our webhook address once, asking it to print a key it gives us */
export async function vivaWebhookKey() {
  const r = await fetch(V().basic + '/api/messages/config/token', {
    headers: { authorization: 'Basic ' + btoa(env('VIVA_MERCHANT_ID') + ':' + env('VIVA_API_KEY')) }
  });
  const d = await r.json().catch(() => ({}));
  return d.Key || d.key || null;
}

export { euro };
