/* POST /api/checkout — creates the order and sends the visitor to pay.
   The page sends ONLY: which products, which variant, how many, the coupon and the buyer's details.
   Every price is recalculated here from the catalogue kept on the server. */
import { readCatalog, priceCart, payMethods, json, bad, newOrderId, rand, putOrder, store, siteUrl, markPaid, sendOrderMails, loadKeys } from './_lib/core.mjs';
import { stripeCheckout, vivaCheckout } from './_lib/pay.mjs';

const clean = (v, n = 120) => String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, n);

export default async (req) => {
  await loadKeys();
  if (req.method !== 'POST') return bad('Μόνο POST', 405);
  let body; try { body = await req.json(); } catch (e) { return bad('Λάθος αίτημα'); }
  if (body.website) return json({ ok: true, url: '/' }); // honeypot: bots fill hidden fields

  const cat = await readCatalog();
  const methods = payMethods(cat);
  const method = String(body.method || '');
  if (!methods[method]) return bad('Αυτός ο τρόπος πληρωμής δεν είναι διαθέσιμος.');

  const priced = priceCart(cat, body.items, body.coupon);
  if (priced.errors.length) return bad(priced.errors.join(' '), 409, { priced });
  if (!priced.lines.length) return bad('Το καλάθι είναι άδειο.');
  /* the page shows a total; if it is different from the server's, we stop and show the right one */
  if (body.expectTotal != null && Number(body.expectTotal) !== priced.total) return bad('Οι τιμές άλλαξαν μόλις τώρα — ελέγξτε το νέο σύνολο.', 409, { priced });

  const c = body.customer || {};
  const customer = {
    name: clean(c.name, 80), email: clean(c.email, 120).toLowerCase(), phone: clean(c.phone, 30),
    invoice: !!c.invoice, company: clean(c.company, 120), afm: clean(c.afm, 12).replace(/\D/g, ''),
    doy: clean(c.doy, 60), address: clean(c.address, 160), notes: clean(c.notes, 600)
  };
  if (customer.name.length < 3) return bad('Γράψτε το ονοματεπώνυμό σας.');
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(customer.email)) return bad('Το e-mail δεν φαίνεται σωστό.');
  if (customer.phone.replace(/\D/g, '').length < 10) return bad('Γράψτε ένα τηλέφωνο επικοινωνίας.');
  if (customer.invoice && (customer.afm.length !== 9 || !customer.company || !customer.doy || !customer.address)) return bad('Για τιμολόγιο χρειάζονται επωνυμία, ΑΦΜ (9 ψηφία), ΔΟΥ και διεύθυνση.');
  if (!body.terms) return bad('Χρειάζεται να αποδεχτείτε τους όρους.');

  const s = store();
  const order = {
    id: newOrderId(), token: rand(24), createdAt: new Date().toISOString(),
    status: 'pending', method, customer, priced, provider: {},
    history: [{ at: new Date().toISOString(), what: 'Δημιουργήθηκε' }]
  };

  /* a 100% coupon: nothing to charge */
  if (priced.total === 0) {
    order.method = 'free'; await putOrder(order, s);
    await markPaid(order, { amount: 0, how: 'χωρίς χρέωση' }, s);
    return json({ ok: true, url: `/order.html?o=${order.id}&k=${order.token}` });
  }

  const base = siteUrl(req);
  try {
    if (method === 'bank') {
      order.status = 'awaiting_transfer';
      order.history.push({ at: new Date().toISOString(), what: 'Περιμένουμε την κατάθεση' });
      await putOrder(order, s);
      await sendOrderMails(order, 'new').catch(e => console.warn(e));
      return json({ ok: true, url: `/order.html?o=${order.id}&k=${order.token}` });
    }
    const go = method === 'stripe' ? await stripeCheckout(order, base) : await vivaCheckout(order);
    order.provider = method === 'stripe' ? { stripeSession: go.ref } : { vivaOrderCode: go.ref };
    await putOrder(order, s);
    if (method === 'viva') await s.set('viva/' + go.ref, order.id); // so the Viva return can find the order
    return json({ ok: true, url: go.url });
  } catch (e) {
    console.error(e);
    order.status = 'failed'; order.history.push({ at: new Date().toISOString(), what: 'Δεν ξεκίνησε η πληρωμή: ' + e.message });
    await putOrder(order, s).catch(() => {});
    return bad('Η πληρωμή δεν μπόρεσε να ξεκινήσει. Δοκιμάστε ξανά ή επιλέξτε άλλο τρόπο.', 502);
  }
};
export const config = { path: '/api/checkout' };
