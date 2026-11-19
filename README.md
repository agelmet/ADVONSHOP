# Advon Shop

Ηλεκτρονικό κατάστημα της Advon Media (και «κουτί» για e-shop πελατών).

- `index.html` — το κατάστημα (φτιάχνεται από `tools/build.mjs` + `data/catalog.json`)
- `admin.html` — πίνακας διαχείρισης
- `order.html` — σελίδα «Ευχαριστούμε»
- `assets/js/pricing.mjs` — ΟΛΟΙ οι υπολογισμοί τιμών (ίδιο αρχείο σε σελίδα και server)
- `netlify/functions/` — checkout, webhooks Stripe/Viva, πίνακας, εικόνες (Netlify Blobs)
- `odigos/` — οδηγός για τον Άγγελο

Αλλαγή καταλόγου εκκίνησης: `data/catalog.json` → `node tools/build.mjs`.
Στο live οι αλλαγές γίνονται από τον πίνακα (Netlify Blobs) — χωρίς deploy.
