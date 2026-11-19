/* GET /api/catalog — the live catalogue for the shop page (no secrets inside) */
import { readCatalog, payMethods, json, loadKeys } from './_lib/core.mjs';

export default async () => {
  await loadKeys();
  const cat = await readCatalog();
  const pub = JSON.parse(JSON.stringify(cat));
  pub.products = pub.products.filter(p => p.active !== false).map(p => { delete p.example; delete p.cost; return p; });
  pub.coupons = []; // codes stay secret; they are checked on the server
  delete pub.settings.notifyEmail;
  delete pub.settings.bank; // bank details are shown only on an order's own page, never in the public catalogue
  pub.pay = payMethods(cat);
  pub.live = true;
  return json(pub, 200, { 'cache-control': 'public, max-age=0, must-revalidate', 'netlify-cdn-cache-control': 'public, s-maxage=300, stale-while-revalidate=60', 'netlify-cache-tag': 'catalog' });
};
export const config = { path: '/api/catalog' };
