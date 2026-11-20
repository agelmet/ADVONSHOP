/* Advon Shop — shared server code for all the Netlify functions.
   Everything secret (keys, passwords) comes from Netlify «Environment variables»,
   never from the page and never from the repo. */
import { getStore } from '@netlify/blobs';
import seed from './seed.mjs';
import { priceCart, cartSummary, euro } from '../../../assets/js/pricing.mjs';

export { priceCart, cartSummary, euro };

/* keys typed in the panel (Ρυθμίσεις → Σύνδεση πληρωμών) are kept in the private store,
   so adding or changing a key needs NO new deploy (0 credits). Netlify environment variables still win if set. */
export const PANEL_KEYS = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'VIVA_ENV', 'VIVA_CLIENT_ID', 'VIVA_CLIENT_SECRET', 'VIVA_SOURCE_CODE', 'VIVA_MERCHANT_ID', 'VIVA_API_KEY', 'RESEND_API_KEY'];
let KEYS = {}, keysAt = 0;
export async function loadKeys(force = false) {
  if (!force && Date.now() - keysAt < 30000) return KEYS;
  try { KEYS = (await store().get('secret/keys.json', { type: 'json' })) || {}; } catch (e) { KEYS = KEYS || {}; }
  keysAt = Date.now(); return KEYS;
}
export const env = (k, d = '') => {
  try { if (globalThis.Netlify && Netlify.env && Netlify.env.get(k)) return Netlify.env.get(k); } catch (e) {}
  if (process.env[k]) return process.env[k];
  return KEYS[k] != null && KEYS[k] !== '' ? KEYS[k] : d;
};

/* ---------- storage (Netlify Blobs: a small private key/value drive) ---------- */
export function store() {
  if (globalThis.__SHOP_STORE__) return globalThis.__SHOP_STORE__; // local tests
  return getStore({ name: 'advon-shop', consistency: 'strong' });
}

/* the shop's layout version: a saved catalogue from an older layout is replaced by the new starting
   catalogue (its settings and coupons are kept; the old one stays in history on the next save) */
export const SCHEMA = seed.schema || 1;
export function upgrade(c) {
  if (!c || !c.products) return JSON.parse(JSON.stringify(seed));
  if ((c.schema || 1) === SCHEMA) return c;
  const n = JSON.parse(JSON.stringify(seed));
  n.settings = { ...n.settings, ...(c.settings || {}), payments: { ...n.settings.payments, ...((c.settings || {}).payments || {}) } };
  n.coupons = c.coupons || n.coupons; n.version = c.version || 0;
  return n;
}
export async function readCatalog(s = store()) {
  const c = await s.get('catalog.json', { type: 'json' }).catch(() => null);
  return upgrade(c);
}

export async function writeCatalog(cat, s = store()) {
  const prev = await s.get('catalog.json', { type: 'json' }).catch(() => null);
  if (prev && prev.products) {
    await s.setJSON('history/' + String(Date.now()).padStart(15, '0') + '.json', prev);
    const { blobs } = await s.list({ prefix: 'history/' });
    const keys = blobs.map(b => b.key).sort();
    for (const k of keys.slice(0, Math.max(0, keys.length - 30))) await s.delete(k);
  }
  await s.setJSON('catalog.json', cat);
}

/* ---------- small helpers ---------- */
export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

export const bad = (msg, status = 400, extra = {}) => json({ ok: false, error: msg, ...extra }, status);

export function rand(n = 24, abc = 'abcdefghijkmnpqrstuvwxyz23456789') {
  const b = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(b, x => abc[x % abc.length]).join('');
}

export function newOrderId() {
  const d = new Date();
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, '');
  return 'A' + ymd + '-' + rand(4, 'BCDFGHJKLMNPQRSTVWXZ23456789');
}

export async function sha256hex(s) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join('');
}

export async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function safeEqual(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function siteUrl(req) {
  const fixed = env('SITE_URL');
  if (fixed) return fixed.replace(/\/$/, '');
  const ctx = env('CONTEXT');
  if (ctx === 'production' && env('URL')) return env('URL').replace(/\/$/, '');
  if (env('DEPLOY_PRIME_URL')) return env('DEPLOY_PRIME_URL').replace(/\/$/, '');
  return new URL(req.url).origin;
}

/* which ways of paying are switched on AND have their keys set */
export function payMethods(cat) {
  const p = (cat.settings && cat.settings.payments) || {};
  const b = (cat.settings && cat.settings.bank) || {};
  return {
    stripe: p.stripe !== false && !!env('STRIPE_SECRET_KEY'),
    viva: p.viva !== false && !!(env('VIVA_CLIENT_ID') && env('VIVA_CLIENT_SECRET') && env('VIVA_SOURCE_CODE')),
    bank: p.bank !== false && !!b.iban
  };
}

/* ---------- orders ---------- */
export const orderKey = id => 'orders/' + id + '.json';
export async function getOrder(id, s = store()) {
  if (!/^A\d{6}-[A-Z0-9]{4}$/.test(String(id || ''))) return null;
  return s.get(orderKey(id), { type: 'json' }).catch(() => null);
}
export async function putOrder(o, s = store()) { o.updatedAt = new Date().toISOString(); await s.setJSON(orderKey(o.id), o); }

/* the one function that turns an order into «paid»: amount checked, stock + coupon counted, e-mails sent */
export async function markPaid(o, info, s = store()) {
  if (!o || o.status === 'paid' || o.status === 'done') return { changed: false, order: o };
  if (info.amount != null && Number(info.amount) !== Number(o.priced.total)) {
    o.history.push({ at: new Date().toISOString(), what: 'Το ποσό που πληρώθηκε (' + euro(info.amount) + ') δεν ταιριάζει με την παραγγελία — ΕΛΕΓΞΤΕ ΤΟ' });
    o.flag = 'amount-mismatch';
    await putOrder(o, s);
    return { changed: false, order: o, mismatch: true };
  }
  o.status = 'paid'; delete o.flag;
  o.paidAt = new Date().toISOString();
  o.provider = { ...(o.provider || {}), ...info.provider };
  o.history.push({ at: o.paidAt, what: 'Πληρώθηκε — ' + (info.how || o.method) });
  await putOrder(o, s);
  /* stock and coupon uses */
  try {
    const cat = await readCatalog(s);
    let touched = false;
    for (const l of o.priced.lines) {
      if (l.extra) continue;
      const p = cat.products.find(x => x.id === l.id);
      if (p && Number.isFinite(p.stock)) { p.stock = Math.max(0, p.stock - l.qty); touched = true; }
    }
    if (o.priced.coupon) {
      const c = (cat.coupons || []).find(x => String(x.code).toUpperCase() === String(o.priced.coupon.code).toUpperCase());
      if (c) { c.uses = (c.uses || 0) + 1; touched = true; }
    }
    if (touched) await s.setJSON('catalog.json', cat);
  } catch (e) { console.warn('stock/coupon', e); }
  const mailed = await sendOrderMails(o, 'paid').catch(e => { console.warn('mail', e); return false; });
  if (mailed) { o.mailed = true; await putOrder(o, s).catch(() => {}); }
  return { changed: true, order: o };
}

/* ---------- e-mail through Resend (optional: without a key nothing is sent, orders still work) ---------- */
export async function sendMail({ to, subject, html, replyTo }) {
  const key = env('RESEND_API_KEY');
  if (!key || !to) return false;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env('SHOP_FROM', 'Advon Media <forms@advonmedia.com>'), to: [to], subject, html, reply_to: replyTo || undefined })
  });
  if (!r.ok) console.warn('resend', r.status, await r.text());
  return r.ok;
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const METHOD = { stripe: 'Κάρτα (Stripe)', viva: 'Κάρτα / IRIS (Viva)', bank: 'Τραπεζική κατάθεση', free: 'Χωρίς χρέωση' };

function orderHtml(o, cat, forOwner) {
  const pr = o.priced, c = o.customer, s = (cat && cat.settings) || {};
  const rows = pr.lines.map(l => `<tr><td style="padding:8px 0;border-bottom:1px solid #E6EAF2">${l.qty} × ${esc(l.name)}${l.vname ? '<br><span style="color:#5B6478;font-size:13px">' + esc(l.vname) + '</span>' : ''}${l.note ? '<br><span style="color:#5B6478;font-size:13px">«' + esc(l.note) + '»</span>' : ''}</td><td style="padding:8px 0;border-bottom:1px solid #E6EAF2;text-align:right;white-space:nowrap">${euro(l.gross, { always2: true })}</td></tr>`).join('');
  const bank = o.method === 'bank' && s.bank ? `<div style="margin:18px 0;padding:14px 16px;background:#F2F7FE;border-radius:12px;font-size:14px;line-height:1.6"><b>Στοιχεία κατάθεσης</b><br>${esc(s.bank.bankName || '')}<br>IBAN: <b>${esc(s.bank.iban)}</b><br>Επωνυμία: ${esc(s.bank.holder || '')}<br>Αιτιολογία: <b>${esc(o.id)}</b><br>Ποσό: <b>${euro(pr.total, { always2: true })}</b></div>` : '';
  const inv = c.invoice ? `<p style="font-size:13px;color:#5B6478;margin:12px 0 0">Τιμολόγιο: ${esc(c.company)} · ΑΦΜ ${esc(c.afm)} · ΔΟΥ ${esc(c.doy)} · ${esc(c.address)}</p>` : '';
  const who = forOwner ? `<p style="font-size:14px;margin:0 0 12px"><b>${esc(c.name)}</b> · ${esc(c.email)} · ${esc(c.phone)}${c.notes ? '<br>Σημείωση: ' + esc(c.notes) : ''}</p>` : '';
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#0B1220">
  <div style="height:4px;background:linear-gradient(90deg,#1C6FD8,#47C8F5);border-radius:4px"></div>
  <h2 style="font-size:20px;margin:22px 0 6px">${forOwner ? 'Νέα παραγγελία' : 'Ευχαριστούμε για την παραγγελία σας'} — ${esc(o.id)}</h2>
  <p style="color:#5B6478;margin:0 0 16px;font-size:14px">${esc(METHOD[o.method] || o.method)} · ${o.status === 'paid' ? '<b style="color:#0E8A4F">Πληρώθηκε</b>' : (o.status === 'awaiting_transfer' ? '<b style="color:#B26A00">Αναμένουμε την κατάθεση</b>' : esc(o.status))}</p>
  ${who}<table style="width:100%;border-collapse:collapse;font-size:15px">${rows}</table>
  <table style="width:100%;font-size:14px;margin-top:10px">
   ${pr.discount ? `<tr><td colspan="2" style="color:#0E8A4F">Οι τιμές περιλαμβάνουν την έκπτωση ${esc(pr.coupon && pr.coupon.code)} (−${euro(pr.discount, { always2: true })} πριν τον ΦΠΑ)</td></tr>` : ''}
   <tr><td>Καθαρή αξία</td><td style="text-align:right">${euro(pr.net, { always2: true })}</td></tr>
   <tr><td>ΦΠΑ</td><td style="text-align:right">${euro(pr.vat, { always2: true })}</td></tr>
   ${pr.shipping ? `<tr><td>Μεταφορικά</td><td style="text-align:right">${euro(pr.shipping, { always2: true })}</td></tr>` : ''}
   <tr><td style="font-size:17px;padding-top:6px"><b>Σύνολο</b></td><td style="text-align:right;font-size:17px;padding-top:6px"><b>${euro(pr.total, { always2: true })}</b></td></tr>
  </table>${bank}${inv}
  ${forOwner ? '' : `<p style="font-size:14px;line-height:1.6;margin-top:18px">Θα επικοινωνήσουμε μαζί σας σύντομα για τα επόμενα βήματα. Για οτιδήποτε, απαντήστε σε αυτό το e-mail.</p>`}
  <p style="font-size:12px;color:#8A93A6;margin-top:24px">${esc((s.legal && s.legal.name) || s.shopName || 'Advon Media')}</p></div>`;
}

export async function sendOrderMails(o, why) {
  const cat = await readCatalog().catch(() => seed);
  const s = cat.settings || {};
  const owner = env('SHOP_NOTIFY_TO') || s.notifyEmail;
  const tag = why === 'paid' ? '✅ Πληρώθηκε' : (o.method === 'bank' ? '🏦 Αναμονή κατάθεσης' : 'Νέα');
  await sendMail({ to: owner, subject: `${tag} · ${o.id} · ${euro(o.priced.total, { always2: true })} · ${o.customer.name}`, html: orderHtml(o, cat, true), replyTo: o.customer.email });
  return await sendMail({ to: o.customer.email, subject: `Η παραγγελία σας ${o.id} — ${s.shopName || 'Advon Media'}`, html: orderHtml(o, cat, false), replyTo: s.email || owner });
}

/* ---------- admin login token ---------- */
const DEFAULT_PASS_HASH = 'fe579300b43660d0ea801cf7c777d55b98630bef64087f44078771702329fd17'; // sha256 of the starting passcode (set ADMIN_PASS to change it)
/* the key that signs panel logins: ADMIN_SECRET if set, otherwise a random one kept in the private store */
export async function adminSecret() {
  if (env('ADMIN_SECRET')) return env('ADMIN_SECRET');
  const s = store();
  let k = await s.get('secret/admin.txt').catch(() => null);
  if (!k) { k = rand(48); await s.set('secret/admin.txt', k); }
  return k + ':' + (env('ADMIN_PASS') ? await sha256hex(env('ADMIN_PASS')) : DEFAULT_PASS_HASH);
}
export async function checkPass(pass) {
  const want = env('ADMIN_PASS') ? await sha256hex(env('ADMIN_PASS')) : DEFAULT_PASS_HASH;
  return safeEqual(await sha256hex(String(pass || '')), want);
}
export async function makeToken() {
  const exp = Date.now() + 30 * 864e5;
  return exp + '.' + await hmacHex(await adminSecret(), 'adm.' + exp);
}
export async function checkToken(t) {
  const [exp, sig] = String(t || '').split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmacHex(await adminSecret(), 'adm.' + exp));
}
