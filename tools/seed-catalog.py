# python3 tools/seed-catalog.py  →  data/catalog.json (the STARTING catalogue).
# Prices = advonmedia.com (Nov 2026). «example: True» = suggested by Claude, shown with a yellow badge in the panel.
import json

B = lambda *xs: '\n'.join('• ' + x for x in xs)
cats = [
    {"id": "site", "name": "Ιστοσελίδες & E-shop", "desc": "Κατασκευή δωρεάν για ιστοσελίδες — η τιμή περιλαμβάνει φιλοξενία και domain name."},
    {"id": "social", "name": "Social Media & Διαφημίσεις", "desc": "Instagram, Facebook και Google που φέρνουν πελάτες. Μηνιαία συνδρομή, χωρίς δέσμευση."},
    {"id": "bundles", "name": "Πακέτα", "desc": "Social media και διαφημίσεις μαζί — σε καλύτερη τιμή."},
    {"id": "extras", "name": "Προσθήκες", "desc": "Για την ιστοσελίδα σας — νέα ή υπάρχουσα."},
    {"id": "more", "name": "Επιπλέον", "desc": "Για πελάτες μας και για ειδικές περιστάσεις."},
]
P = []
def add(**k):
    k.setdefault('unit', 'once'); k.setdefault('vat', 24); k.setdefault('active', True); k.setdefault('maxQty', 1)
    k.setdefault('sku', k['id'].upper()); k.setdefault('img', 'assets/img/p/' + k['id'] + '.webp'); P.append(k)
L = lambda *xs: '\n'.join(xs)
NM = 'Χωρίς δέσμευση'

# Prices below are FINAL (+ ΦΠΑ). Angelo, 20 Nov 2026: the prices that were raised by the card fee (1,5% + 0,25 €)
# are kept as they were (e-shop 694, social 51/81/102, Meta 81, Google 61, bundles, articles 72, panel 184, Maps 92,
# changes 52, online booking 5,50/16); the ones he set himself are written as he said them.
WEB = 13200   # «11 € / μήνα», paid yearly
STRIKE = '500 – 5.000 €'
BUDGET = 'Χωρίς το ποσό των διαφημίσεων (από 5 € / ημέρα)'
# ---------- websites & e-shop (one per order) ----------
add(id='site', cat='site', kind='build', name='Ιστοσελίδα', price=WEB, unit='year', perMonth=True, strike=STRIKE, badge='Δημοφιλές',
    short='Σχεδιασμένη μόνο για εσάς. Κατασκευή δωρεάν — πληρώνετε μόνο τη φιλοξενία.',
    desc=B('Κατασκευή δωρεάν (αξία 500 € – 5.000 €)', 'Domain name δώρο, φιλοξενία, SSL, backups', 'Έτοιμη σε 1–5 ημέρες — τη βλέπετε πρώτα', 'Απεριόριστες αλλαγές μέχρι να βγει online', 'Ελληνικά & Αγγλικά, SEO για Google και AI'),
    long='Μια σύγχρονη ιστοσελίδα, σχεδιασμένη μόνο για εσάς — όχι από έτοιμο πρότυπο. Τη φτιάχνουμε με τα στοιχεία που ήδη έχετε (π.χ. το προφίλ σας στο Google) και τη βλέπετε έτοιμη μέσα σε 1–5 ημέρες.',
    steps=L('Πληρώνετε τον 1ο χρόνο φιλοξενίας', 'Μας λέτε για την επιχείρησή σας ή μας στέλνετε ένα link', 'Σε 1–5 ημέρες βλέπετε την ιστοσελίδα έτοιμη', 'Κάνουμε όσες αλλαγές θέλετε και βγαίνει online'),
    priceNote='Domain name δώρο',
    variants=[{"id": "basic", "name": "Βασικό", "price": WEB, "note": "Φιλοξενία, domain, SSL, backups, υποστήριξη"},
              {"id": "growth", "name": "Growth", "price": 48000, "note": "+ 3 άρθρα τον μήνα για το Google, 1 αίτημα αλλαγών τον μήνα, μηνιαία αναφορά"}])
add(id='stay', cat='site', kind='build', name='Ιστοσελίδα καταλύματος', price=WEB, unit='year', perMonth=True, strike=STRIKE,
    short='Για βίλες, δωμάτια και διαμερίσματα — κρατήσεις απευθείας, χωρίς προμήθειες.',
    desc=B('Κατασκευή δωρεάν, domain δώρο', 'Χώροι, φωτογραφίες, περιοχή, κριτικές επισκεπτών', 'Ελληνικά & Αγγλικά', 'Κουμπιά κράτησης σε φόρμα, e-mail και τηλέφωνο — ο επισκέπτης κλείνει απευθείας με εσάς', 'Το Α.Μ.Α. του καταλύματος, όπως ζητά ο νόμος'),
    long='Για ιδιοκτήτες που θέλουν κρατήσεις κατευθείαν από τη δική τους σελίδα, χωρίς να δίνουν προμήθεια σε κάθε κράτηση.',
    steps=L('Μας στέλνετε το link από Booking ή Airbnb', 'Παίρνουμε φωτογραφίες, κείμενα και κριτικές από εκεί', 'Σε 1–5 ημέρες βλέπετε την ιστοσελίδα έτοιμη', 'Βγαίνει online στο δικό σας domain'),
    priceNote='Domain name δώρο',
    variants=[{"id": "direct", "name": "Απευθείας κρατήσεις", "price": WEB, "note": "Κράτηση με φόρμα, e-mail ή τηλέφωνο — χωρίς προμήθειες"},
              {"id": "cm", "name": "Με channel manager", "price": WEB, "note": "+ κρατήσεις online στη σελίδα σας, συγχρονισμός με Booking & Airbnb",
               "extras": [{"id": "setup", "name": "Στήσιμο channel manager", "price": 15000, "unit": "once"},
                          {"id": "cm", "name": "Channel manager", "price": 2500, "unit": "month"}]}])
add(id='eshop', cat='site', kind='build', name='E-shop', price=69400, example=True, badge='Νέο',
    short='Δικό σας ηλεκτρονικό κατάστημα — χωρίς προμήθειες σε πλατφόρμες.',
    desc=B('Κατασκευή + 1ος χρόνος φιλοξενίας', 'Κάρτα, Apple Pay, Google Pay, IRIS', 'Τα χρήματα πάνε κατευθείαν σε εσάς', 'Ανεβάζουμε εμείς τα προϊόντα σας', 'Πίνακας για προϊόντα, τιμές, εκπτώσεις'),
    long='Ένα κατάστημα που είναι δικό σας: χωρίς προμήθειες σε κάθε πώληση. Εμείς το στήνουμε, ανεβάζουμε τα προϊόντα και συνδέουμε τις πληρωμές· εσείς αλλάζετε τιμές και προϊόντα από τον πίνακα, όποτε θέλετε.',
    steps=L('Μας λέτε πόσα και ποια προϊόντα έχετε', 'Στήνουμε το κατάστημα και ανεβάζουμε τα προϊόντα', 'Συνδέουμε τις πληρωμές στον δικό σας λογαριασμό', 'Σας δείχνουμε τον πίνακα σε μια σύντομη κλήση'),
    priceNote='Από τον 2ο χρόνο 296 € / έτος', later='Φιλοξενία e-shop από τον 2ο χρόνο: 296 € / έτος')
add(id='qr', cat='site', kind='build', name='Ψηφιακό μενού QR', price=WEB, unit='year', perMonth=True, example=True,
    short='Δίγλωσσο μενού με φωτογραφίες — αλλάζετε μόνοι σας πιάτα και τιμές.',
    desc=B('Για καφέ, εστιατόρια, μπαρ', 'Ελληνικά & Αγγλικά, με φωτογραφίες', 'Πίνακας για να αλλάζετε μενού και τιμές όποτε θέλετε', 'QR για τα τραπέζια'),
    priceNote='Ιστοσελίδα-μενού · domain δώρο',
    extras=[{"id": "setup", "name": "Πίνακας αλλαγών μενού & τιμών", "price": 7000, "unit": "once"}])
add(id='wedding', cat='site', name='Ιστοσελίδα γάμου / βάπτισης', price=10000, example=True,
    short='Ένα link στο προσκλητήριο: εκκλησία, χάρτης, δήλωση παρουσίας.', desc=B('Δήλωση παρουσίας online', 'Χάρτης για εκκλησία και δεξίωση'))
# ---------- social & ads (monthly) ----------
add(id='social', cat='social', name='Διαχείριση Social Media', price=5100, unit='month',
    short='Instagram & Facebook με την ταυτότητά σας — τα αναλαμβάνουμε όλα.',
    desc=B('Reels, posts & carousels', 'Σχέδιο αναρτήσεων κάθε μήνα', 'Δεν χρειάζεται να μας στείλετε τίποτα', 'Μηνιαία αναφορά'),
    long='Αναλαμβάνουμε το Instagram και το Facebook σας: ιδέες, κείμενα, σχέδια, reels και δημοσίευση — στο ύφος της επιχείρησής σας.',
    steps=L('Μια σύντομη κλήση για να γνωρίσουμε την επιχείρησή σας', 'Σας στέλνουμε το σχέδιο του μήνα', 'Δημοσιεύουμε εμείς, στις καλύτερες ώρες', 'Κάθε μήνα σας στέλνουμε αναφορά'),
    priceNote=NM,
    variants=[{"id": "basic", "name": "8 αναρτήσεις", "price": 5100}, {"id": "growth", "name": "12 αναρτήσεις", "price": 8100}, {"id": "pro", "name": "16 αναρτήσεις", "price": 10200}])
add(id='meta', cat='social', name='Meta Ads', price=8100, unit='month', example=True,
    short='Διαφημίσεις σε Facebook & Instagram που φέρνουν μηνύματα και κλήσεις.',
    desc=B('Στήσιμο καμπάνιας, κοινού και διαφημίσεων', 'Στόχευση στην περιοχή σας', 'Μηνιαία αναφορά αποτελεσμάτων', 'Το ποσό των διαφημίσεων δεν περιλαμβάνεται — πάει απευθείας στη Meta, από 5 € / ημέρα'),
    long='Στήνουμε και διαχειριζόμαστε τις διαφημίσεις σας στο Facebook και στο Instagram, μετράμε τι φέρνει πραγματικές επαφές και βάζουμε τα χρήματα εκεί που αποδίδουν.',
    steps=L('Μια κλήση για τον στόχο σας', 'Φτιάχνουμε διαφημίσεις και καμπάνια', 'Τις βελτιώνουμε κάθε εβδομάδα', 'Κάθε μήνα σας στέλνουμε αναφορά'),
    priceNote=BUDGET, extras=[{"id": "setup", "name": "Στήσιμο καμπάνιας", "price": 10000, "unit": "once"}])
add(id='ads', cat='social', name='Google Ads', price=6100, unit='month', needsSite=True, ourSite=True,
    short='Εμφανίζεστε πρώτοι όταν σας ψάχνουν στο Google. Για ιστοσελίδες που φτιάξαμε εμείς.',
    desc=B('Έρευνα λέξεων-κλειδιών και στήσιμο καμπάνιας', 'Μέτρηση κάθε κλήσης και ραντεβού', 'Προϋπόθεση: η ιστοσελίδα σας να είναι από εμάς', 'Το ποσό των διαφημίσεων δεν περιλαμβάνεται — πάει απευθείας στη Google, από 5 € / ημέρα'),
    long='Όταν κάποιος γράφει στο Google αυτό που κάνετε, στην περιοχή σας, βλέπει πρώτα εσάς. Μετράμε κάθε κλήση και κάθε ραντεβού. Για ιστοσελίδες που έχουμε φτιάξει εμείς (ή που φτιάχνουμε τώρα).',
    steps=L('Βρίσκουμε τι ψάχνουν οι πελάτες σας', 'Στήνουμε την καμπάνια και τη μέτρηση κλήσεων', 'Τη βελτιώνουμε κάθε εβδομάδα', 'Κάθε μήνα σας στέλνουμε αναφορά'),
    priceNote=BUDGET, extras=[{"id": "setup", "name": "Έρευνα & στήσιμο", "price": 5000, "unit": "once"}])
# ---------- bundles (example prices) ----------
def bundle(id, name, price, inc, short, setup, badge=None, needs=False):
    add(id=id, cat='bundles', kind='bundle', name=name, price=price, unit='month', example=True, includes=inc, badge=badge,
        needsSite=needs, ourSite=needs, notWith=['social', 'meta', 'ads'] + [x for x in ['b-start', 'b-grow', 'b-full'] if x != id],
        short=short, priceNote=BUDGET, extras=[{"id": "setup", "name": "Στήσιμο καμπανιών", "price": setup, "unit": "once"}])
bundle('b-start', 'Πακέτο Ξεκίνημα', 11200, ['social:basic', 'meta'], 'Social Media (8 αναρτήσεις) + Meta Ads.', 10000)
bundle('b-grow', 'Πακέτο Ανάπτυξη', 14200, ['social:growth', 'meta'], 'Social Media (12 αναρτήσεις) + Meta Ads.', 10000, badge='Δημοφιλές')
bundle('b-full', 'Πακέτο Πλήρης προβολή', 18300, ['social:growth', 'meta', 'ads'], 'Social Media (12 αναρτήσεις) + Meta Ads + Google Ads.', 15000, needs=True)
# ---------- add-ons ----------
add(id='form', cat='extras', name='Φόρμα επικοινωνίας', price=5000, needsSite=True,
    short='Οι επισκέπτες σάς γράφουν — το λαμβάνετε στο e-mail σας.', desc=B('Με προστασία από spam', 'Έρχεται στο e-mail σας', 'Σύμφωνη με τον GDPR'))
add(id='articles', cat='extras', name='Ενότητα άρθρων', price=7200, needsSite=True,
    short='Γράφετε και δημοσιεύετε άρθρα μόνοι σας.', desc=B('Από το κινητό ή τον υπολογιστή', 'Κάθε άρθρο σε δική του σελίδα για το Google'))
add(id='panel', cat='extras', name='Πίνακας διαχείρισης', price=18400, needsSite=True,
    short='Αλλάζετε μόνοι σας κείμενα και φωτογραφίες.', desc=B('Χωρίς τεχνικές γνώσεις', 'Οι αλλαγές φαίνονται αμέσως'))
add(id='quiz', cat='extras', name='Διαδραστικό τεστ', price=5000, needsSite=True,
    short='Λίγες ερωτήσεις στον επισκέπτη — οι απαντήσεις έρχονται σε εσάς.', desc=B('Οι απαντήσεις στο e-mail σας', 'Φέρνει ραντεβού'))
add(id='ai', cat='extras', name='AI βοηθός', price=2500, unit='month', needsSite=True, example=True,
    short='Απαντά στη στιγμή, σε ελληνικά και αγγλικά, 24 ώρες το 24ωρο.', desc=B('Μαθαίνει τις δικές σας υπηρεσίες', 'Σας στέλνει τα στοιχεία όσων ενδιαφέρονται'), priceNote=NM)
add(id='gbp', cat='extras', name='Google Maps + NFC stand', price=9200,
    short='Πλήρες προφίλ στο Google Maps και stand για κριτικές με ένα άγγιγμα.', desc=B('Κατηγορίες, ώρες, φωτογραφίες, υπηρεσίες', 'Stand στο γραφείο σας: κριτική με ένα άγγιγμα του κινητού'))
add(id='booking', cat='extras', name='Online ραντεβού', price=550, unit='month',
    short='Οι πελάτες κλείνουν μόνοι τους ώρα — με υπενθυμίσεις.', desc=B('Δική σας σελίδα κρατήσεων', 'Υπενθυμίσεις με e-mail'),
    variants=[{"id": "one", "name": "1 άτομο", "price": 550}, {"id": "team", "name": "Ομάδα", "price": 1600}], priceNote=NM)
# ---------- more ----------
add(id='changes', cat='more', name='Αλλαγές σε ιστοσελίδα', price=5200, unit='request', maxQty=5, needsSite=True,
    short='Για ιστοσελίδες που είναι ήδη online. Ένα αίτημα = όσες αλλαγές θέλετε.', desc=B('Γίνονται μέσα σε 3 εργάσιμες', 'Γράφετε όλες τις αλλαγές σε ένα μήνυμα'))
add(id='renew', cat='more', name='Ανανέωση φιλοξενίας', price=WEB, unit='year', perMonth=True, needsSite=True, link='ananeosi.html',
    short='Ένας ακόμα χρόνος για την ιστοσελίδα σας, με το domain μαζί.',
    variants=[{"id": "hosting", "name": "Βασικό", "price": WEB}, {"id": "growth", "name": "Growth", "price": 48000}])

def part(ref):
    pid, _, vid = ref.partition(':'); q = next(x for x in P if x['id'] == pid)
    if vid: return next(v['price'] for v in q['variants'] if v['id'] == vid)
    return q.get('listPrice') or q['price']
for p in P:
    if p.get('kind') == 'bundle': p['compareAt'] = sum(part(r) for r in p['includes'])
for i, p in enumerate(P): p['order'] = i
cat = {"schema": 7, "version": 1, "updatedAt": None, "vatDefault": 24,
       "categories": [dict(c, order=i) for i, c in enumerate(cats)], "products": P,
       "coupons": [{"code": "ADVON10", "type": "pct", "value": 10, "min": 0, "from": None, "to": None, "maxUses": 0, "uses": 0, "active": True, "label": "Δοκιμαστικός κωδικός −10%"}],
       "catSales": [],
       "settings": {"shopName": "Advon Media", "tagline": "Ό,τι χρειάζεται η επιχείρησή σας online.",
                    "notifyEmail": "advonmd@gmail.com", "phone": "", "email": "advonmd@gmail.com",
                    "pricesIncludeVat": False, "askInvoice": True,
                    "payments": {"stripe": True, "viva": True, "bank": False},
                    "bank": {"bankName": "", "iban": "", "holder": ""},
                    "legal": {"name": "Advon Media", "afm": "", "doy": "", "address": "", "gemi": ""},
                    "shipping": {"enabled": False, "flat": 0, "freeOver": 0}, "notice": ""}}
json.dump(cat, open('data/catalog.json', 'w'), ensure_ascii=False, indent=1)
print(len(P), 'products')
