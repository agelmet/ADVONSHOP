/* POST /api/quote — the cart asks «what is my total, with this coupon?».
   Same calculation as the real charge, so the visitor never sees a number we will not charge. */
import { readCatalog, priceCart, json, bad, loadKeys } from './_lib/core.mjs';
export default async (req) => {
  await loadKeys();
  if (req.method !== 'POST') return bad('Μόνο POST', 405);
  let b; try { b = await req.json(); } catch (e) { return bad('Λάθος αίτημα'); }
  const priced = priceCart(await readCatalog(), b.items, b.coupon);
  return json({ ok: true, priced });
};
export const config = { path: '/api/quote' };
