/* POST /api/start-checkout — the card payment of advonmedia.com/ksekinima («Ξεκινάμε τώρα», 21 Nov 2026).
   The page on advonmedia.com has already saved the person's details and material (so nothing is lost if they
   never pay). It sends here only: the intake id, the buyer and whether they chose express delivery.
   The price is FIXED here, on the server — never taken from the page:
     website (build 0 €) = hosting & domain for the first year 130 € + 24% ΦΠΑ = 161,20 €
     express delivery                                        +50 € + 24% ΦΠΑ =  62,00 €
   Angelo absorbs Stripe's fee (no surcharge on the buyer). The order shows in the shop panel like any other;
   after paying, Stripe sends the buyer back to advonmedia.com/ksekinima/?paid=1… which confirms it. */
import { json, newOrderId, rand, putOrder, store, loadKeys, readCatalog, payMethods } from './_lib/core.mjs';
import { stripeCheckout } from './_lib/pay.mjs';

const VAT = 24;
const LINES = {
  site: { id: 'site', v: 'ksekinima', name: 'Ιστοσελίδα — κατασκευή 0 €', vname: 'Φιλοξενία & domain · 1ος χρόνος', net: 13000 },
  express: { id: 'express', v: '', name: 'Express παράδοση', vname: 'Πρώτο σχέδιο σε 1–2 εργάσιμες', net: 5000 },
};
/* only these pages may start a payment and be sent back to */
const OK_BACK = /^https:\/\/((www\.)?advonmedia\.com|[a-z0-9-]+--advonmediaa\.netlify\.app)\/ksekinima\/$/;
const clean = (v, n = 120) => String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, n);

function cors(req, res) {
  const o = req.headers.get('origin') || '';
  const allow = /^https:\/\/((www\.)?advonmedia\.com|[a-z0-9-]+--advonmediaa\.netlify\.app)$/.test(o) ? o : 'https://advonmedia.com';
  res.headers.set('Access-Control-Allow-Origin', allow);
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'content-type');
  res.headers.set('Vary', 'Origin');
  return res;
}
const fail = (req, msg, status = 400) => cors(req, json({ ok: false, error: msg }, status));

export default async (req) => {
  if (req.method === 'OPTIONS') return cors(req, new Response(null, { status: 204 }));
  if (req.method !== 'POST') return fail(req, 'Μόνο POST', 405);
  await loadKeys();
  let b; try { b = await req.json(); } catch { return fail(req, 'Λάθος αίτημα'); }
  if (b.website) return cors(req, json({ ok: true, url: '/' }));                 // honeypot
  const cat = await readCatalog();
  if (!payMethods(cat).stripe) return fail(req, 'Η πληρωμή με κάρτα δεν είναι διαθέσιμη αυτή τη στιγμή.', 503);

  const intake = clean(b.intake, 60);
  if (!/^[a-z0-9-]{3,60}$/.test(intake)) return fail(req, 'Λείπει ο κωδικός της αίτησης.');
  const back = clean(b.back, 200);
  if (!OK_BACK.test(back)) return fail(req, 'Λάθος σελίδα επιστροφής.');
  const c = b.customer || {};
  const customer = {
    name: clean(c.name, 80), email: clean(c.email, 120).toLowerCase(), phone: clean(c.phone, 30),
    invoice: false, company: clean(c.company, 120), afm: clean(c.afm, 12).replace(/\D/g, ''), doy: '', address: '',
    notes: '',
  };
  if (customer.name.length < 3) return fail(req, 'Γράψτε το ονοματεπώνυμό σας.');
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(customer.email)) return fail(req, 'Το e-mail δεν φαίνεται σωστό.');
  if (customer.phone.replace(/\D/g, '').length < 10) return fail(req, 'Γράψτε ένα κινητό.');
  if (!b.terms) return fail(req, 'Χρειάζεται να αποδεχτείτε τους όρους.');
  customer.notes = `Ξεκινάμε τώρα (χωρίς ραντεβού) · υλικό: ${intake}${customer.afm ? ` · Τιμολόγιο: ΑΦΜ ${customer.afm}${customer.company ? ', ' + customer.company : ''}` : ''}`;

  const pick = [LINES.site].concat(b.express ? [LINES.express] : []);
  const lines = pick.map((l) => { const vat = Math.round(l.net * VAT / 100); return { id: l.id, v: l.v, name: l.name, vname: l.vname, qty: 1, net: l.net, vat, gross: l.net + vat }; });
  const net = lines.reduce((a, l) => a + l.net, 0), vat = lines.reduce((a, l) => a + l.vat, 0);
  const priced = { lines, net, vat, discount: 0, coupon: null, shipping: 0, total: net + vat, errors: [] };

  const s = store();
  const order = {
    id: newOrderId(), token: rand(24), createdAt: new Date().toISOString(), source: 'ksekinima', intake,
    status: 'pending', method: 'stripe', customer, priced, provider: {},
    history: [{ at: new Date().toISOString(), what: 'Δημιουργήθηκε από advonmedia.com/ksekinima' }],
  };
  try {
    const urls = {
      success: `${back}?paid=1&id=${encodeURIComponent(intake)}&o=${order.id}&k=${order.token}&sid={CHECKOUT_SESSION_ID}`,
      cancel: `${back}?cancel=1&id=${encodeURIComponent(intake)}`,
    };
    const go = await stripeCheckout(order, back.replace(/\/ksekinima\/$/, ''), urls);
    order.provider = { stripeSession: go.ref };
    await putOrder(order, s);
    return cors(req, json({ ok: true, url: go.url, order: order.id, total: priced.total }));
  } catch (e) {
    console.error(e);
    order.status = 'failed'; order.history.push({ at: new Date().toISOString(), what: 'Δεν ξεκίνησε η πληρωμή: ' + e.message });
    await putOrder(order, s).catch(() => {});
    return fail(req, 'Η πληρωμή δεν μπόρεσε να ξεκινήσει.', 502);
  }
};
export const config = { path: '/api/start-checkout' };
