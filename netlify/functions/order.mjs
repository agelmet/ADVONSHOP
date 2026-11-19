/* GET /api/order — the «thank you» page asks for the status of its order.
   If the payment company's notice has not arrived yet, we ask the company ourselves. */
import { getOrder, store, json, bad, markPaid, safeEqual, readCatalog, loadKeys } from './_lib/core.mjs';
import { stripeSession, vivaTransaction } from './_lib/pay.mjs';

const view = (o, cat) => ({
  bank: o.method === 'bank' && cat ? cat.settings.bank : null,
  ok: true, id: o.id, status: o.status, method: o.method, createdAt: o.createdAt, paidAt: o.paidAt || null,
  priced: { lines: o.priced.lines.map(l => ({ name: l.name, vname: l.vname, qty: l.qty, gross: l.gross, note: l.note })), net: o.priced.net, vat: o.priced.vat, discount: o.priced.discount, coupon: o.priced.coupon, shipping: o.priced.shipping, total: o.priced.total },
  name: o.customer.name.split(' ')[0]
});

export default async (req) => {
  await loadKeys();
  const u = new URL(req.url), s = store();
  let o = null;
  const vs = u.searchParams.get('s'), vt = u.searchParams.get('t');
  if (vs && /^\d{10,20}$/.test(vs)) {               // coming back from Viva: ?t=<transaction>&s=<order code>
    const id = await s.get('viva/' + vs).catch(() => null);
    o = id ? await getOrder(id, s) : null;
    if (!o) return bad('Δεν βρέθηκε η παραγγελία.', 404);
    if (o.status === 'pending' && vt) {
      const tx = await vivaTransaction(vt).catch(() => null);
      if (tx && tx.statusId === 'F' && String(tx.orderCode) === vs)
        await markPaid(o, { amount: Math.round(Number(tx.amount) * 100), how: 'Viva', provider: { vivaTx: vt } }, s);
    }
    return json(view(o, await readCatalog(s)));
  }
  o = await getOrder(u.searchParams.get('o'), s);
  if (!o || !safeEqual(o.token, u.searchParams.get('k') || '')) return bad('Δεν βρέθηκε η παραγγελία.', 404);
  const sid = u.searchParams.get('sid');
  if (o.status === 'pending' && o.method === 'stripe' && sid && sid === o.provider.stripeSession) {
    const ss = await stripeSession(sid).catch(() => null);
    if (ss && ss.payment_status === 'paid' && ss.client_reference_id === o.id)
      await markPaid(o, { amount: ss.amount_total, how: 'Stripe', provider: { stripePI: ss.payment_intent } }, s);
  }
  return json(view(o, await readCatalog(s)));
};
export const config = { path: '/api/order' };
