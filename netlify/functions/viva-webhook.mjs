/* /api/webhooks/viva — GET: Viva checks the address once (we print its key).
   POST: «payment created». We do not trust the message itself: we ask Viva about the transaction. */
import { getOrder, store, json, markPaid, loadKeys } from './_lib/core.mjs';
import { vivaWebhookKey, vivaTransaction } from './_lib/pay.mjs';

export default async (req) => {
  await loadKeys();
  if (req.method === 'GET') return json({ Key: await vivaWebhookKey().catch(() => null) });
  let ev; try { ev = await req.json(); } catch (e) { return json({ ok: true }); }
  if (Number(ev.EventTypeId) !== 1796) return json({ ok: true, ignored: ev.EventTypeId });
  const d = ev.EventData || {};
  const tx = await vivaTransaction(d.TransactionId).catch(() => null);
  if (!tx || tx.statusId !== 'F') return json({ ok: true, ignored: 'not final' });
  const s = store();
  const id = await s.get('viva/' + String(tx.orderCode)).catch(() => null) || tx.merchantTrns;
  const o = await getOrder(id, s);
  if (o && o.provider && String(o.provider.vivaOrderCode) === String(tx.orderCode))
    await markPaid(o, { amount: Math.round(Number(tx.amount) * 100), how: 'Viva', provider: { vivaTx: d.TransactionId } }, s);
  return json({ ok: true });
};
export const config = { path: '/api/webhooks/viva' };
