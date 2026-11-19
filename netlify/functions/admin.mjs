/* POST /api/admin — everything the owner's panel does. Every action except «login» needs the panel token. */
import { purgeCache } from '@netlify/functions';
import { readCatalog, writeCatalog, store, json, bad, checkPass, makeToken, checkToken, getOrder, putOrder, markPaid, payMethods, rand, loadKeys, env, PANEL_KEYS, SCHEMA } from './_lib/core.mjs';

const STATUSES = ['pending', 'awaiting_transfer', 'paid', 'done', 'cancelled', 'failed', 'refunded'];
const isInt = (n, max = 1e8) => Number.isInteger(n) && n >= 0 && n <= max;
const str = (v, n) => typeof v === 'string' ? v.slice(0, n) : (v == null ? '' : String(v).slice(0, n));
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const day = v => (v && DAY.test(v)) ? v : null;

/* the panel can send anything — keep only what makes sense, with safe limits */
const ids = a => (Array.isArray(a) ? a : []).map(x => String(x).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40)).filter(Boolean).slice(0, 10);
function cleanCatalog(c, prev) {
  const errs = [];
  const cats = (Array.isArray(c.categories) ? c.categories : []).slice(0, 200).map((x, i) => ({
    id: str(x.id, 40).toLowerCase().replace(/[^a-z0-9-]/g, '') || 'cat-' + i, name: str(x.name, 80) || 'Κατηγορία', desc: str(x.desc, 300), order: i
  }));
  const catIds = new Set(cats.map(x => x.id));
  const seen = new Set();
  const products = (Array.isArray(c.products) ? c.products : []).slice(0, 5000).map((p, i) => {
    const id = str(p.id, 40).toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!id || seen.has(id)) { errs.push('Διπλό ή κενό αναγνωριστικό προϊόντος: ' + (p.name || i)); return null; }
    seen.add(id);
    const price = Math.round(Number(p.price));
    if (!isInt(price)) errs.push('Λάθος τιμή: ' + p.name);
    const vids = new Set();
    const variants = (Array.isArray(p.variants) ? p.variants : []).slice(0, 50).map((v, j) => {
      let vid = str(v.id, 30).toLowerCase().replace(/[^a-z0-9-]/g, '') || 'v' + j; while (vids.has(vid)) vid += 'x'; vids.add(vid);
      const vp = Math.round(Number(v.price)); if (!isInt(vp)) errs.push('Λάθος τιμή επιλογής: ' + p.name + ' / ' + v.name);
      const out = { id: vid, name: str(v.name, 120) || 'Επιλογή', price: vp };
      if (v.note) out.note = str(v.note, 200);
      if (v.example) out.example = true;
      const vr = ids(v.requires); if (vr.length) out.requires = vr;
      if (v.salePrice != null && v.salePrice !== '') out.salePrice = Math.round(Number(v.salePrice));
      return out;
    });
    const sale = p.sale && (p.sale.pct || p.sale.price != null) ? {
      active: p.sale.active !== false, pct: p.sale.pct ? Math.min(95, Math.max(1, Math.round(Number(p.sale.pct)))) : null,
      price: p.sale.price != null && p.sale.price !== '' ? Math.round(Number(p.sale.price)) : null,
      from: day(p.sale.from), to: day(p.sale.to), label: str(p.sale.label, 40) || null
    } : null;
    const vat = [0, 6, 13, 24, 4, 9, 17].includes(Number(p.vat)) ? Number(p.vat) : 24;
    return {
      id, sku: str(p.sku, 40) || id.toUpperCase(), cat: catIds.has(p.cat) ? p.cat : (cats[0] && cats[0].id),
      name: str(p.name, 160) || 'Χωρίς όνομα', short: str(p.short, 300), desc: str(p.desc, 4000),
      price: isInt(price) ? price : 0, unit: ['once', 'year', 'month', 'request', 'page', 'piece'].includes(p.unit) ? p.unit : 'once',
      vat, maxQty: Math.max(1, Math.min(999, Math.round(Number(p.maxQty) || 1))),
      stock: p.stock === '' || p.stock == null ? null : Math.max(0, Math.round(Number(p.stock))),
      variants, sale, badge: str(p.badge, 40) || null, featured: !!p.featured, active: p.active !== false,
      img: p.img && /^(\/api\/img\/|assets\/)[\w./-]+$/.test(p.img) ? p.img : null,
      ask: str(p.ask, 160) || null, askRequired: !!p.askRequired, example: !!p.example, order: i,
      /* how the shop puts things together — kept exactly as they are */
      kind: ['build', 'hosting', 'bundle'].includes(p.kind) ? p.kind : null, requires: ids(p.requires), notWith: ids(p.notWith),
      needsSite: !!p.needsSite, listed: p.listed !== false, quote: !!p.quote, priceNote: str(p.priceNote, 160) || null,
      icon: str(p.icon, 20).replace(/[^a-z]/g, '') || null,
      group: str(p.group, 60) || null, long: str(p.long, 2000) || null, steps: str(p.steps, 1000) || null,
      includes: (Array.isArray(p.includes) ? p.includes : []).map(x => String(x).toLowerCase().replace(/[^a-z0-9:-]/g, '').slice(0, 60)).filter(Boolean).slice(0, 10),
      listPrice: p.listPrice === '' || p.listPrice == null || !isInt(Math.round(Number(p.listPrice))) ? null : Math.round(Number(p.listPrice)),
      later: str(p.later, 200) || null, link: /^[a-z0-9-]+\.html$/.test(String(p.link || '')) ? p.link : null,
      compareAt: p.compareAt === '' || p.compareAt == null || !isInt(Math.round(Number(p.compareAt))) ? null : Math.round(Number(p.compareAt))
    };
  }).filter(Boolean);
  const codes = new Set();
  const coupons = (Array.isArray(c.coupons) ? c.coupons : []).slice(0, 500).map(x => {
    const code = str(x.code, 30).toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!code || codes.has(code)) { if (code) errs.push('Διπλός κωδικός: ' + code); return null; }
    codes.add(code);
    const old = prev && (prev.coupons || []).find(y => y.code === code);
    return {
      code, type: x.type === 'fixed' ? 'fixed' : 'pct', value: Math.max(0, Math.round(Number(x.value) || 0)),
      min: Math.max(0, Math.round(Number(x.min) || 0)), from: day(x.from), to: day(x.to),
      maxUses: Math.max(0, Math.round(Number(x.maxUses) || 0)), uses: old ? (old.uses || 0) : Math.max(0, Math.round(Number(x.uses) || 0)),
      active: x.active !== false, label: str(x.label, 80) || null, cats: Array.isArray(x.cats) ? x.cats.filter(y => catIds.has(y)) : []
    };
  }).filter(Boolean);
  const catSales = (Array.isArray(c.catSales) ? c.catSales : []).slice(0, 100).filter(x => catIds.has(x.cat)).map(x => ({
    cat: x.cat, pct: Math.min(95, Math.max(1, Math.round(Number(x.pct) || 1))), from: day(x.from), to: day(x.to), active: x.active !== false, label: str(x.label, 40) || null
  }));
  const s = c.settings || {}, b = s.bank || {}, l = s.legal || {}, sh = s.shipping || {}, pay = s.payments || {};
  const settings = {
    shopName: str(s.shopName, 80) || 'Κατάστημα', tagline: str(s.tagline, 200), notifyEmail: str(s.notifyEmail, 120), email: str(s.email, 120), phone: str(s.phone, 30),
    pricesIncludeVat: !!s.pricesIncludeVat, askInvoice: s.askInvoice !== false,
    payments: { stripe: pay.stripe !== false, viva: pay.viva !== false, bank: pay.bank !== false },
    bank: { bankName: str(b.bankName, 60), iban: str(b.iban, 40).replace(/\s/g, '').toUpperCase(), holder: str(b.holder, 120) },
    legal: { name: str(l.name, 160), afm: str(l.afm, 12), doy: str(l.doy, 60), address: str(l.address, 200), gemi: str(l.gemi, 30) },
    shipping: { enabled: !!sh.enabled, flat: Math.max(0, Math.round(Number(sh.flat) || 0)), freeOver: Math.max(0, Math.round(Number(sh.freeOver) || 0)) },
    notice: str(s.notice, 300)
  };
  return { errs, cat: { schema: SCHEMA, version: (prev && prev.version || 0) + 1, updatedAt: new Date().toISOString(), vatDefault: 24, categories: cats, products, coupons, catSales, settings } };
}

async function listOrders(s, limit = 200) {
  const { blobs } = await s.list({ prefix: 'orders/' });
  const keys = blobs.map(b => b.key).sort().reverse().slice(0, limit);
  const out = await Promise.all(keys.map(k => s.get(k, { type: 'json' }).catch(() => null)));
  return out.filter(Boolean).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

const GR = { α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o' };
const greekToLatin = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[α-ω]/g, ch => GR[ch] || '');

const purge = async () => { try { await purgeCache({ tags: ['catalog'] }); } catch (e) { /* local / not on Netlify */ } };

export default async (req) => {
  await loadKeys();
  if (req.method !== 'POST') return bad('Μόνο POST', 405);
  let b; try { b = await req.json(); } catch (e) { return bad('Λάθος αίτημα'); }
  const s = store();

  if (b.action === 'login') {
    if (!(await checkPass(b.pass))) { await new Promise(r => setTimeout(r, 800)); return bad('Λάθος κωδικός.', 401); }
    return json({ ok: true, token: await makeToken() });
  }
  if (!(await checkToken(b.token))) return bad('Η σύνδεση έληξε — μπείτε ξανά.', 401);

  switch (b.action) {
    case 'load': {
      const cat = await readCatalog(s);
      const { blobs } = await s.list({ prefix: 'history/' });
      return json({ ok: true, catalog: cat, pay: payMethods(cat), undo: blobs.length });
    }
    case 'save': {
      const prev = await readCatalog(s);
      if (b.baseVersion != null && prev.version != null && Number(b.baseVersion) !== Number(prev.version))
        return bad('Ο κατάλογος άλλαξε από άλλη συσκευή. Ανανεώστε τη σελίδα και ξαναδοκιμάστε.', 409);
      const { errs, cat } = cleanCatalog(b.catalog || {}, prev);
      if (errs.length) return bad(errs.slice(0, 5).join(' · '), 422);
      await writeCatalog(cat, s); await purge();
      return json({ ok: true, catalog: cat });
    }
    case 'undo': {
      const { blobs } = await s.list({ prefix: 'history/' });
      const last = blobs.map(x => x.key).sort().pop();
      if (!last) return bad('Δεν υπάρχει προηγούμενη αποθήκευση.');
      const old = await s.get(last, { type: 'json' });
      const cur = await readCatalog(s);
      old.version = (cur.version || 0) + 1; old.updatedAt = new Date().toISOString();
      await s.setJSON('catalog.json', old); await s.delete(last); await purge();
      return json({ ok: true, catalog: old });
    }
    case 'keys': {
      const k = await loadKeys(true);
      const out = {};
      for (const n of PANEL_KEYS) { const v = env(n); out[n] = v ? { set: true, end: n === 'VIVA_ENV' ? v : '…' + String(v).slice(-4), fromHosting: !k[n] } : { set: false }; }
      return json({ ok: true, keys: out });
    }
    case 'setKeys': {
      const k = { ...(await loadKeys(true)) };
      const inp = b.keys || {};
      const rules = { STRIPE_SECRET_KEY: /^(sk|rk)_(test|live)_[A-Za-z0-9]{10,}$/, STRIPE_WEBHOOK_SECRET: /^whsec_[A-Za-z0-9]{10,}$/, VIVA_ENV: /^(demo|live)$/, VIVA_SOURCE_CODE: /^\d{4}$/, RESEND_API_KEY: /^re_[A-Za-z0-9_]{10,}$/ };
      for (const n of PANEL_KEYS) {
        if (!(n in inp)) continue;
        const v = String(inp[n] == null ? '' : inp[n]).trim();
        if (v === '') { delete k[n]; continue; }
        if (v.length > 400 || /\s/.test(v)) return bad('Το κλειδί ' + n + ' δεν φαίνεται σωστό.');
        if (rules[n] && !rules[n].test(v)) return bad('Το ' + n + ' δεν φαίνεται σωστό — αντιγράψτε το ξανά ολόκληρο.');
        k[n] = v;
      }
      await s.setJSON('secret/keys.json', k); await loadKeys(true); await purge();
      return json({ ok: true, pay: payMethods(await readCatalog(s)) });
    }
    case 'orders': return json({ ok: true, orders: (await listOrders(s)).map(o => { const x = { ...o }; delete x.token; return x; }) });
    case 'status': {
      const o = await getOrder(b.id, s);
      if (!o) return bad('Δεν βρέθηκε.', 404);
      if (!STATUSES.includes(b.status)) return bad('Λάθος κατάσταση.');
      if (b.status === 'paid' && o.status !== 'paid') {
        await markPaid(o, { how: 'σημειώθηκε από τον πίνακα' + (o.method === 'bank' ? ' (κατάθεση)' : '') }, s);
      } else {
        o.status = b.status;
        o.history.push({ at: new Date().toISOString(), what: 'Κατάσταση: ' + b.status + (b.note ? ' — ' + str(b.note, 200) : '') });
        await putOrder(o, s);
      }
      return json({ ok: true, order: await getOrder(b.id, s) });
    }
    case 'note': {
      const o = await getOrder(b.id, s); if (!o) return bad('Δεν βρέθηκε.', 404);
      o.ownerNote = str(b.note, 1000); await putOrder(o, s); return json({ ok: true });
    }
    case 'upload': {
      const m = /^data:(image\/(webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''));
      if (!m) return bad('Μόνο εικόνες.');
      const bytes = Uint8Array.from(atob(m[3]), ch => ch.charCodeAt(0));
      if (bytes.length > 1.6e6) return bad('Η φωτογραφία είναι πολύ μεγάλη.');
      const ext = m[2] === 'jpeg' ? 'jpg' : m[2];
      const name = (greekToLatin(str(b.name, 40)).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'foto') + '-' + rand(6) + '.' + ext;
      await s.set('img/' + name, bytes, { metadata: { type: m[1] } });
      return json({ ok: true, url: '/api/img/' + name });
    }
    default: return bad('Άγνωστη ενέργεια.');
  }
};
export const config = { path: '/api/admin' };
