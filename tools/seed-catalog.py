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

# ---------- websites & e-shop (one per order) ----------
add(id='site', cat='site', kind='build', name='Ιστοσελίδα', price=13000, unit='year', badge='Δημοφιλές',
    short='Σχεδιασμένη μόνο για εσάς. Κατασκευή δωρεάν — πληρώνετε μόνο τη φιλοξενία.',
    desc=B('Κατασκευή δωρεάν (αξία 700 € – 5.000 €)', 'Domain name δώρο, φιλοξενία, SSL, backups', 'Έτοιμη σε 1–5 ημέρες — τη βλέπετε πρώτα', 'Απεριόριστες αλλαγές μέχρι να βγει online', 'Ελληνικά & Αγγλικά, SEO για Google και AI'),
    long='Μια σύγχρονη ιστοσελίδα, σχεδιασμένη μόνο για εσάς — όχι από έτοιμο πρότυπο. Τη φτιάχνουμε με τα στοιχεία που ήδη έχετε (π.χ. το προφίλ σας στο Google) και τη βλέπετε έτοιμη μέσα σε 1–5 ημέρες.',
    steps=L('Πληρώνετε τον 1ο χρόνο φιλοξενίας', 'Μας λέτε για την επιχείρησή σας ή μας στέλνετε ένα link', 'Σε 1–5 ημέρες βλέπετε την ιστοσελίδα έτοιμη', 'Κάνουμε όσες αλλαγές θέλετε και βγαίνει online'),
    priceNote='Κατασκευή 0 € · domain δώρο',
    variants=[{"id": "basic", "name": "Βασικό", "price": 13000, "note": "Φιλοξενία, domain, SSL, backups, υποστήριξη"},
              {"id": "growth", "name": "Growth", "price": 47500, "note": "+ 3 άρθρα τον μήνα για το Google, 1 αίτημα αλλαγών τον μήνα, μηνιαία αναφορά"}])
add(id='stay', cat='site', kind='build', name='Ιστοσελίδα καταλύματος', price=13000, unit='year',
    short='Για βίλες, δωμάτια και διαμερίσματα — κρατήσεις χωρίς προμήθειες.',
    desc=B('Κατασκευή δωρεάν, domain δώρο', 'Χώροι, φωτογραφίες, περιοχή, κριτικές επισκεπτών', 'Ελληνικά & Αγγλικά', 'Αίτημα κράτησης σε WhatsApp ή e-mail', 'Το Α.Μ.Α. του καταλύματος, όπως ζητά ο νόμος'),
    long='Για ιδιοκτήτες που θέλουν κρατήσεις κατευθείαν από τη δική τους σελίδα, χωρίς να δίνουν προμήθεια σε κάθε κράτηση.',
    steps=L('Μας στέλνετε το link από Booking ή Airbnb', 'Παίρνουμε φωτογραφίες, κείμενα και κριτικές από εκεί', 'Σε 1–5 ημέρες βλέπετε την ιστοσελίδα έτοιμη', 'Βγαίνει online στο δικό σας domain'),
    priceNote='Κατασκευή 0 € · domain δώρο',
    variants=[{"id": "b1", "name": "Βασικό", "price": 13000, "note": "Κουμπιά κράτησης σε Booking / Airbnb"},
              {"id": "b2", "name": "Με ημερολόγιο", "price": 23000, "note": "+ ημερολόγιο διαθεσιμότητας & αίτημα κράτησης", "example": True},
              {"id": "b3", "name": "Με channel manager", "price": 39000, "note": "+ δικές σας κρατήσεις, συγχρονισμός με Booking & Airbnb", "example": True}])
add(id='eshop', cat='site', kind='build', name='E-shop', price=68000, example=True, badge='Νέο',
    short='Δικό σας ηλεκτρονικό κατάστημα — χωρίς προμήθειες σε πλατφόρμες.',
    desc=B('Κατασκευή + 1ος χρόνος φιλοξενίας', 'Κάρτα, Apple Pay, Google Pay, IRIS', 'Τα χρήματα πάνε κατευθείαν σε εσάς', 'Ανεβάζουμε εμείς τα προϊόντα σας', 'Πίνακας για προϊόντα, τιμές, εκπτώσεις'),
    long='Ένα κατάστημα που είναι δικό σας: χωρίς προμήθειες σε κάθε πώληση. Εμείς το στήνουμε, ανεβάζουμε τα προϊόντα και συνδέουμε τις πληρωμές· εσείς αλλάζετε τιμές και προϊόντα από τον πίνακα, όποτε θέλετε.',
    steps=L('Μας λέτε πόσα και ποια προϊόντα έχετε', 'Στήνουμε το κατάστημα και ανεβάζουμε τα προϊόντα', 'Συνδέουμε τις πληρωμές στον δικό σας λογαριασμό', 'Σας δείχνουμε τον πίνακα σε μια σύντομη κλήση'),
    priceNote='Από τον 2ο χρόνο 290 € / έτος', later='Φιλοξενία e-shop από τον 2ο χρόνο: 290 € / έτος')
# ---------- social & ads (monthly) ----------
add(id='social', cat='social', name='Διαχείριση Social Media', price=4900, unit='month',
    short='Instagram & Facebook με την ταυτότητά σας — τα αναλαμβάνουμε όλα.',
    desc=B('Reels, posts & carousels', 'Σχέδιο αναρτήσεων κάθε μήνα', 'Δεν χρειάζεται να μας στείλετε τίποτα', 'Μηνιαία αναφορά'),
    long='Αναλαμβάνουμε το Instagram και το Facebook σας: ιδέες, κείμενα, σχέδια, reels και δημοσίευση — στο ύφος της επιχείρησής σας.',
    steps=L('Μια σύντομη κλήση για να γνωρίσουμε την επιχείρησή σας', 'Σας στέλνουμε το σχέδιο του μήνα', 'Δημοσιεύουμε εμείς, στις καλύτερες ώρες', 'Κάθε μήνα σας στέλνουμε αναφορά'),
    priceNote=NM,
    variants=[{"id": "basic", "name": "8 αναρτήσεις", "price": 4900}, {"id": "growth", "name": "12 αναρτήσεις", "price": 7900}, {"id": "pro", "name": "16 αναρτήσεις", "price": 9900}])
add(id='meta', cat='social', name='Meta Ads', price=7900, unit='month', example=True,
    short='Διαφημίσεις σε Facebook & Instagram που φέρνουν μηνύματα και κλήσεις.',
    desc=B('Στήσιμο καμπάνιας και διαφημίσεων', 'Στόχευση στην περιοχή σας', 'Μηνιαία αναφορά αποτελεσμάτων', 'Το ποσό διαφήμισης πάει απευθείας στη Meta (από 5 €/ημέρα)'),
    long='Στήνουμε και διαχειριζόμαστε τις διαφημίσεις σας στο Facebook και στο Instagram, μετράμε τι φέρνει πραγματικές επαφές και βάζουμε τα χρήματα εκεί που αποδίδουν.',
    steps=L('Μια κλήση για τον στόχο σας', 'Φτιάχνουμε διαφημίσεις και καμπάνια', 'Τις βελτιώνουμε κάθε εβδομάδα', 'Κάθε μήνα σας στέλνουμε αναφορά'),
    priceNote=NM)
add(id='ads', cat='social', name='Google Ads', price=0, listPrice=5900, unit='month', needsSite=True, badge='1ος μήνας δωρεάν',
    short='Εμφανίζεστε πρώτοι όταν σας ψάχνουν στο Google.',
    desc=B('Στήσιμο δωρεάν και 1ος μήνας δωρεάν', 'Μέτρηση κάθε κλήσης και ραντεβού', 'Εγγύηση 60 ημερών: αν δεν φέρει επαφές, δεν πληρώνετε εμάς', 'Το ποσό διαφήμισης πάει απευθείας στη Google (από 5 €/ημέρα)'),
    long='Όταν κάποιος γράφει στο Google αυτό που κάνετε, στην περιοχή σας, βλέπει πρώτα εσάς. Μετράμε κάθε κλήση και κάθε ραντεβού.',
    steps=L('Βρίσκουμε τι ψάχνουν οι πελάτες σας', 'Στήνουμε την καμπάνια και τη μέτρηση κλήσεων', 'Τη βελτιώνουμε κάθε εβδομάδα', 'Κάθε μήνα σας στέλνουμε αναφορά'),
    priceNote='Ο 1ος μήνας δωρεάν', later='Google Ads από τον 2ο μήνα: 59 € / μήνα')
# ---------- bundles (example prices) ----------
def bundle(id, name, price, inc, was, short, badge=None, needs=False):
    add(id=id, cat='bundles', kind='bundle', name=name, price=price, unit='month', example=True, includes=inc, badge=badge,
        needsSite=needs, notWith=['social', 'meta', 'ads'] + [x for x in ['b-start', 'b-grow', 'b-full'] if x != id],
        short=short, compareAt=was, priceNote=NM)
bundle('b-start', 'Πακέτο Ξεκίνημα', 10900, ['social:basic', 'meta'], 12800, 'Social Media (8 αναρτήσεις) + Meta Ads.')
bundle('b-grow', 'Πακέτο Ανάπτυξη', 13900, ['social:growth', 'meta'], 15800, 'Social Media (12 αναρτήσεις) + Meta Ads.', badge='Δημοφιλές')
bundle('b-full', 'Πακέτο Πλήρης προβολή', 17900, ['social:growth', 'meta', 'ads'], 21700, 'Social Media (12 αναρτήσεις) + Meta Ads + Google Ads.', needs=True)
# ---------- add-ons ----------
add(id='form', cat='extras', name='Φόρμα επικοινωνίας', price=5000, needsSite=True,
    short='Οι επισκέπτες σάς γράφουν — το λαμβάνετε στο e-mail σας.', desc=B('Με προστασία από spam', 'Έρχεται στο e-mail σας', 'Σύμφωνη με τον GDPR'))
add(id='articles', cat='extras', name='Ενότητα άρθρων', price=7000, needsSite=True,
    short='Γράφετε και δημοσιεύετε άρθρα μόνοι σας.', desc=B('Από το κινητό ή τον υπολογιστή', 'Κάθε άρθρο σε δική του σελίδα για το Google'))
add(id='panel', cat='extras', name='Πίνακας διαχείρισης', price=18000, needsSite=True,
    short='Αλλάζετε μόνοι σας κείμενα και φωτογραφίες.', desc=B('Χωρίς τεχνικές γνώσεις', 'Οι αλλαγές φαίνονται αμέσως'))
add(id='quiz', cat='extras', name='Διαδραστικό τεστ', price=18000, needsSite=True,
    short='Λίγες ερωτήσεις στον επισκέπτη — οι απαντήσεις έρχονται σε εσάς.', desc=B('Οι απαντήσεις στο e-mail σας', 'Φέρνει ραντεβού'))
add(id='ai', cat='extras', name='AI βοηθός', price=2900, unit='month', needsSite=True, example=True,
    short='Απαντά στη στιγμή, σε ελληνικά και αγγλικά, 24 ώρες το 24ωρο.', desc=B('Μαθαίνει τις δικές σας υπηρεσίες', 'Σας στέλνει τα στοιχεία όσων ενδιαφέρονται'), priceNote=NM)
add(id='gbp', cat='extras', name='Google Maps + NFC stand', price=9000,
    short='Πλήρες προφίλ στο Google Maps και stand για κριτικές με ένα άγγιγμα.', desc=B('Κατηγορίες, ώρες, φωτογραφίες, υπηρεσίες', 'Stand στο γραφείο σας: κριτική με ένα άγγιγμα του κινητού'))
add(id='booking', cat='extras', name='Online ραντεβού', price=500, unit='month',
    short='Οι πελάτες κλείνουν μόνοι τους ώρα — με υπενθυμίσεις.', desc=B('Δική σας σελίδα κρατήσεων', 'Υπενθυμίσεις με e-mail'),
    variants=[{"id": "one", "name": "1 άτομο", "price": 500}, {"id": "team", "name": "Ομάδα", "price": 1500}], priceNote=NM)
# ---------- more ----------
add(id='changes', cat='more', name='Αλλαγές σε ιστοσελίδα', price=5000, unit='request', maxQty=5, needsSite=True,
    short='Για ιστοσελίδες που είναι ήδη online. Ένα αίτημα = όσες αλλαγές θέλετε.', desc=B('Γίνονται μέσα σε 3 εργάσιμες', 'Γράφετε όλες τις αλλαγές σε ένα μήνυμα'))
add(id='renew', cat='more', name='Ανανέωση φιλοξενίας', price=13000, unit='year', needsSite=True, link='ananeosi.html',
    short='Ένας ακόμα χρόνος για την ιστοσελίδα σας, με το domain μαζί.',
    variants=[{"id": "hosting", "name": "Βασικό", "price": 13000}, {"id": "growth", "name": "Growth", "price": 47500}])
add(id='qr', cat='extras', name='Ψηφιακό μενού QR', price=9000, example=True,
    short='Δίγλωσσο μενού με φωτογραφίες — αλλάζετε τιμές όποτε θέλετε.', desc=B('Για καφέ, εστιατόρια, μπαρ', 'Ελληνικά & Αγγλικά'))
add(id='wedding', cat='more', name='Ιστοσελίδα γάμου / βάπτισης', price=9000, example=True,
    short='Ένα link στο προσκλητήριο: εκκλησία, χάρτης, δήλωση παρουσίας.', desc=B('Δήλωση παρουσίας online', 'Χάρτης για εκκλησία και δεξίωση'))

for i, p in enumerate(P): p['order'] = i
cat = {"schema": 5, "version": 1, "updatedAt": None, "vatDefault": 24,
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
