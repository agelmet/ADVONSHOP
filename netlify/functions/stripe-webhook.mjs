/* POST /api/webhooks/stripe — Stripe tells us «this order was paid».
   We check Stripe's signature first; a message without a valid signature is ignored. */
import { getOrder, store, json, bad, markPaid, putOrder, loadKeys } from './_lib/core.mjs';
import { stripeVerify } from './_lib/pay.mjs';

export default async (req) => {
  await loadKeys();
  const raw = await req.text();
  const ev = await stripeVerify(raw, req.headers.get('stripe-signature'));
  if (!ev) return bad('bad signature', 400);
  const obj = ev.data && ev.data.object || {};
  const id = obj.client_reference_id || (obj.metadata && obj.metadata.order);
  const s = store();
  const o = await getOrder(id, s);
  if (!o) return json({ ok: true, ignored: 'unknown order' });
  if ((ev.type === 'checkout.session.completed' && obj.payment_status === 'paid') || ev.type === 'checkout.session.async_payment_succeeded') {
    await markPaid(o, { amount: obj.amount_total, how: 'Stripe', provider: { stripeSession: obj.id, stripePI: obj.payment_intent } }, s);
  } else if (ev.type === 'checkout.session.async_payment_failed' || ev.type === 'checkout.session.expired') {
    if (o.status === 'pending') {
      o.status = 'failed'; o.history.push({ at: new Date().toISOString(), what: ev.type === 'checkout.session.expired' ? 'Έληξε χωρίς πληρωμή' : 'Η πληρωμή απέτυχε' });
      await putOrder(o, s);
    }
  }
  return json({ ok: true });
};
export const config = { path: '/api/webhooks/stripe' };
