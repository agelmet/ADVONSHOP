/* node tools/build.mjs — bakes the catalogue into the pages (so Google sees the real services)
   and into the server's starting copy (netlify/functions/_lib/seed.mjs). */
import fs from 'node:fs';
import { grid, hostingStrip, bundles, extras, clientsBlock, moreBlock, catTiles, fromPrice, esc, icon } from '../assets/js/render.mjs';

const cat = JSON.parse(fs.readFileSync('data/catalog.json', 'utf8'));
/* safety: nothing personal goes into a public file */
const raw = JSON.stringify(cat);
if (/\bGR\d{2}[\s\d]{10,}/.test(raw) || (cat.settings.bank && cat.settings.bank.iban)) { console.error('✗ The catalogue contains an IBAN — refusing to build (bank transfer stays off for now).'); process.exit(1); }

const pub = JSON.parse(raw);
pub.coupons = []; delete pub.settings.notifyEmail; pub.settings.bank = { bankName: '', iban: '', holder: '' };
pub.products = pub.products.filter(p => p.active !== false).map(p => { delete p.example; return p; });

const s = cat.settings, L = s.legal || {};
const legal = [L.name, L.afm && 'ΑΦΜ ' + L.afm, L.doy && 'ΔΟΥ ' + L.doy, L.gemi && 'ΓΕΜΗ ' + L.gemi, L.address, s.email].filter(Boolean).map(esc).join(' · ');
const withVat = c => s.pricesIncludeVat ? c : Math.round(c * 1.24);

const listed = pub.products.filter(p => p.listed !== false && !p.quote);
const jsonld = {
  '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': 'https://advonmedia.com/#org', name: 'Advon Media', url: 'https://advonmedia.com', logo: 'https://advonmedia.com/favicon.ico', email: s.email || undefined, areaServed: 'GR' },
    { '@type': 'ItemList', name: 'Υπηρεσίες Advon Media', itemListElement: listed.map((p, i) => {
      const fp = fromPrice(pub, p);
      return { '@type': 'ListItem', position: i + 1, item: { '@type': 'Service', name: p.name, description: p.short, provider: { '@id': 'https://advonmedia.com/#org' },
        offers: { '@type': 'Offer', priceCurrency: 'EUR', price: (withVat(fp.price || 0) / 100).toFixed(2) } } };
    }) }
  ]
};
const seed = JSON.stringify(pub).replace(/</g, '\\u003c');
const html = fs.readFileSync('tools/index.src.html', 'utf8')
  .replace('{{TILES}}', catTiles(pub)).replace('{{G_SITE}}', grid(pub, 'site', {})).replace('{{HOSTING}}', hostingStrip(pub))
  .replace('{{G_ESHOP}}', grid(pub, 'eshop', {})).replace('{{G_SOCIAL}}', grid(pub, 'social', {})).replace('{{G_ADS}}', grid(pub, 'ads', {}))
  .replace('{{G_BUNDLES}}', bundles(pub, {})).replace('{{G_EXTRAS}}', extras(pub, {})).replace('{{CLIENTS}}', clientsBlock(pub)).replace('{{MORE}}', moreBlock(pub, {}))
  .replace(/{{ICON_([A-Z]+)}}/g, (m, n) => icon(n.toLowerCase()))
  .replace('{{SEED}}', seed).replace(/{{LEGAL}}/g, legal)
  .replace('{{JSONLD}}', '<script type="application/ld+json">' + JSON.stringify(jsonld).replace(/</g, '\\u003c') + '</script>');
fs.writeFileSync('index.html', html);

const renew = fs.readFileSync('tools/ananeosi.src.html', 'utf8').replace('{{SEED}}', seed).replace(/{{LEGAL}}/g, legal);
fs.writeFileSync('ananeosi.html', renew);

fs.writeFileSync('netlify/functions/_lib/seed.mjs', '/* starting catalogue — written by tools/build.mjs from data/catalog.json. After the first save in the panel, the live catalogue lives in Netlify Blobs. */\nexport default ' + JSON.stringify(cat, null, 1) + ';\n');
console.log('index.html', (html.length / 1024).toFixed(1) + ' KB · services', listed.length);

const legalFull = [L.name, L.address, L.afm && 'ΑΦΜ ' + L.afm, L.doy && 'ΔΟΥ ' + L.doy, L.gemi && 'Αρ. ΓΕΜΗ ' + L.gemi, s.email && 'e-mail: ' + s.email].filter(Boolean).map(esc).join(' · ');
const page = fs.readFileSync('tools/page.src.html', 'utf8');
for (const [file, title] of [['oroi', 'Όροι αγοράς'], ['privacy', 'Πολιτική απορρήτου']]) {
  const body = fs.readFileSync(`tools/${file}.body.html`, 'utf8').replace(/{{LEGALFULL}}/g, legalFull).replace(/{{EMAIL}}/g, `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>`);
  fs.writeFileSync(file + '.html', page.replace('{{TITLE}}', title).replace('{{BODY}}', body).replace(/{{LEGAL}}/g, legal));
}
