# python3 tools/seed-catalog.py  →  data/catalog.json (the STARTING catalogue).
# Prices = advonmedia.com (Nov 2026). «example: True» = suggested by Claude, shown with a yellow badge in the panel.
import json

B = lambda *xs: '\n'.join('• ' + x for x in xs)
cats = [
    {"id": "site", "name": "Ιστοσελίδες", "desc": "Δωρεάν κατασκευή — πληρώνετε μόνο τη φιλοξενία, με το domain name δώρο."},
    {"id": "eshop", "name": "E-shop", "desc": "Δικό σας ηλεκτρονικό κατάστημα, χωρίς προμήθειες σε πλατφόρμες."},
    {"id": "social", "name": "Social Media", "desc": "Instagram & Facebook που δουλεύουν για την επιχείρησή σας, κάθε μήνα."},
    {"id": "ads", "name": "Διαφημίσεις", "desc": "Meta Ads και Google Ads που φέρνουν κλήσεις, μηνύματα και ραντεβού."},
    {"id": "bundles", "name": "Πακέτα", "desc": "Social media και διαφημίσεις μαζί — σε καλύτερη τιμή."},
    {"id": "extras", "name": "Προσθήκες", "desc": "Ό,τι χρειάζεται ακόμα η ιστοσελίδα σας."},
    {"id": "hosting", "name": "Φιλοξενία", "desc": "Μπαίνει μαζί με κάθε ιστοσελίδα — το domain name είναι δώρο."},
    {"id": "clients", "name": "Για πελάτες μας", "desc": "Για ιστοσελίδες που έχουμε ήδη φτιάξει."},
    {"id": "more", "name": "Άλλες λύσεις", "desc": "Λύσεις που στήνουμε στα μέτρα σας."},
]
P = []
def add(**k):
    k.setdefault('unit', 'once'); k.setdefault('vat', 24); k.setdefault('active', True); k.setdefault('maxQty', 1)
    k.setdefault('sku', k['id'].upper()); k.setdefault('img', 'assets/img/p/' + k['id'] + '.webp'); P.append(k)
L = lambda *xs: '\n'.join(xs)

HOST_SITE = ['hosting', 'growth']
# ---------- websites ----------
add(id='site', cat='site', kind='build', name='Ιστοσελίδα επαγγελματία', price=0, icon='site', featured=True, badge='Δημοφιλές',
    short='Δωρεάν κατασκευή. Πληρώνετε μόνο τη φιλοξενία — δώρο το domain name.',
    desc=B('Τη βλέπετε πρώτα έτοιμη, σε 1–5 ημέρες', 'Απεριόριστες αλλαγές μέχρι να βγει online', 'Ελληνικά & Αγγλικά, πρώτα για κινητό', 'SEO για το Google και τις αναζητήσεις μέσω AI', 'Κριτικές Google, χάρτης, κουμπί κλήσης'),
    long='Μια σύγχρονη ιστοσελίδα, σχεδιασμένη μόνο για εσάς — όχι από έτοιμο πρότυπο. Τη φτιάχνουμε με τα στοιχεία που ήδη έχετε (π.χ. το προφίλ σας στο Google ή στο doctoranytime) και τη βλέπετε έτοιμη πριν πληρώσετε οτιδήποτε άλλο.',
    steps=L('Μας λέτε για την επιχείρησή σας ή μας στέλνετε ένα link', 'Σε 1–5 ημέρες βλέπετε την ιστοσελίδα έτοιμη', 'Κάνουμε όσες αλλαγές θέλετε', 'Βγαίνει online στο δικό σας domain'),
    priceNote='αξία κατασκευής 700 € – 5.000 €', requires=HOST_SITE)
add(id='stay', cat='site', kind='build', name='Ιστοσελίδα καταλύματος', price=0, icon='stay',
    short='Για βίλες, δωμάτια και διαμερίσματα — με κρατήσεις χωρίς προμήθειες.',
    desc=B('Χώροι, φωτογραφίες, περιοχή, κριτικές επισκεπτών', 'Ελληνικά & Αγγλικά', 'Αίτημα κράτησης σε WhatsApp ή e-mail', 'Το Α.Μ.Α. του καταλύματος, όπως ζητά ο νόμος'),
    long='Για ιδιοκτήτες που θέλουν κρατήσεις κατευθείαν από τη δική τους σελίδα, χωρίς να δίνουν προμήθεια σε κάθε κράτηση. Ξεκινάτε απλά και προσθέτετε ημερολόγιο ή channel manager όποτε θέλετε.',
    steps=L('Μας στέλνετε το link από Booking ή Airbnb', 'Παίρνουμε φωτογραφίες, κείμενα και κριτικές από εκεί', 'Σε 1–5 ημέρες βλέπετε την ιστοσελίδα έτοιμη', 'Βγαίνει online στο δικό σας domain'),
    variants=[{"id": "p1", "name": "Με κουμπιά κράτησης σε Booking / Airbnb", "price": 0},
              {"id": "p2", "name": "+ ημερολόγιο διαθεσιμότητας & αίτημα κράτησης", "price": 10000},
              {"id": "p3", "name": "+ δική σας μηχανή κρατήσεων με channel manager", "price": 19000, "requires": ["beds24"]}],
    requires=HOST_SITE)
# ---------- e-shop ----------
add(id='eshop', cat='eshop', kind='build', name='E-shop', price=39000, icon='shop', badge='Νέο',
    short='Δικό σας κατάστημα με πληρωμές με κάρτα, IRIS, Apple Pay — και εύκολο πίνακα διαχείρισης.',
    desc=B('Τα χρήματα πάνε κατευθείαν στον δικό σας λογαριασμό', 'Κάρτα, Apple Pay, Google Pay, IRIS', 'Προϊόντα, τιμές, εκπτώσεις και κουπόνια από το κινητό', 'Ανεβάζουμε εμείς όλα τα προϊόντα σας', 'Φτιαγμένο πρώτα για κινητό, με SEO'),
    long='Ένα κατάστημα που είναι δικό σας: χωρίς μηνιαίες συνδρομές σε πλατφόρμες και χωρίς προμήθειες σε κάθε πώληση. Εμείς το στήνουμε, ανεβάζουμε τα προϊόντα και συνδέουμε τις πληρωμές· εσείς αλλάζετε τιμές και προϊόντα από τον πίνακα, όποτε θέλετε.',
    steps=L('Μας λέτε πόσα και ποια προϊόντα έχετε', 'Στήνουμε το κατάστημα και ανεβάζουμε τα προϊόντα', 'Συνδέουμε τις πληρωμές στον δικό σας λογαριασμό', 'Σας δείχνουμε τον πίνακα διαχείρισης σε μια σύντομη κλήση'),
    variants=[{"id": "half", "name": "Προκαταβολή 50% — ξεκινάμε αμέσως", "price": 19500}, {"id": "full", "name": "Ολόκληρο το ποσό", "price": 39000}],
    requires=['eshop-hosting'])
# ---------- hosting (always with a website) ----------
add(id='hosting', cat='hosting', kind='hosting', name='Φιλοξενία', price=13000, unit='year', featured=True, img=None,
    short='10,83 €/μήνα — τιμολογείται ως 130 € τον χρόνο.',
    desc=B('Domain name δωρεάν — περιλαμβάνεται', 'Φιλοξενία σε παγκόσμιο δίκτυο (CDN)', 'Πιστοποιητικό ασφαλείας SSL', 'Αυτόματα backups και τακτικός έλεγχος', 'Τεχνική υποστήριξη'))
add(id='growth', cat='hosting', kind='hosting', name='Growth', price=47500, unit='year', badge='Προτείνεται', img=None,
    short='39,58 €/μήνα — όλα της Φιλοξενίας, και η σελίδα σας μεγαλώνει κάθε μήνα.',
    desc=B('Όλα όσα περιλαμβάνει η Φιλοξενία', '3 άρθρα κάθε μήνα, γραμμένα για το Google', 'Ενότητα άρθρων χωρίς επιπλέον χρέωση', '1 αίτημα αλλαγών κάθε μήνα χωρίς χρέωση', 'Μέτρηση κλικ στο τηλέφωνο, μηνιαία αναφορά', 'Προτεραιότητα στις αλλαγές'))
add(id='eshop-hosting', cat='hosting', kind='hosting', name='Φιλοξενία e-shop', price=29000, unit='year', example=True, img=None,
    short='24,17 €/μήνα — τιμολογείται ως 290 € τον χρόνο.',
    desc=B('Domain name δωρεάν', 'Οι πληρωμές να δουλεύουν πάντα σωστά', 'Ασφάλεια, backups, τεχνική υποστήριξη', 'Ο πίνακας διαχείρισης χωρίς όριο αλλαγών'))
add(id='beds24', cat='hosting', kind='hosting', name='Φιλοξενία + channel manager', price=39000, unit='year', example=True, img=None,
    short='Ιστοσελίδα, φιλοξενία και συγχρονισμός με Booking, Airbnb, Expedia.',
    desc=B('Ένα ημερολόγιο, καμία διπλοκράτηση', 'Κρατήσεις στη σελίδα σας χωρίς προμήθειες', 'Φιλοξενία και domain name μέσα'))
# ---------- social media ----------
add(id='social', cat='social', name='Διαχείριση Social Media', price=4900, unit='month', icon='social', featured=True,
    short='Instagram & Facebook με την ταυτότητά σας — χωρίς να μας δώσετε κωδικούς.',
    desc=B('Reels με υπότιτλους, posts & carousels', 'Σχέδιο αναρτήσεων κάθε μήνα', 'Δεν χρειάζεται να μας στείλετε τίποτα', 'Πρόσβαση συνεργάτη που αφαιρείτε με ένα κλικ', 'Μηνιαία γραπτή αναφορά'),
    long='Αναλαμβάνουμε το Instagram και το Facebook σας ολόκληρα: ιδέες, κείμενα, σχέδια, reels και δημοσίευση. Κάθε ανάρτηση βγαίνει στο ύφος της επιχείρησής σας και ξέρετε από πριν τι θα δημοσιευτεί.',
    steps=L('Μια σύντομη κλήση για να γνωρίσουμε την επιχείρησή σας', 'Σας στέλνουμε το σχέδιο του μήνα', 'Δημοσιεύουμε εμείς, στις καλύτερες ώρες', 'Κάθε μήνα σας στέλνουμε γραπτή αναφορά'),
    variants=[{"id": "basic", "name": "Βασικό · 8 αναρτήσεις", "price": 4900}, {"id": "growth", "name": "Ανάπτυξη · 12 αναρτήσεις", "price": 7900}, {"id": "pro", "name": "Pro · 16 αναρτήσεις", "price": 9900}],
    priceNote='χρεώνεται ο 1ος μήνας · χωρίς δέσμευση')
# ---------- ads ----------
add(id='meta', cat='ads', name='Meta Ads (Facebook & Instagram)', price=7900, unit='month', icon='ads', example=True, badge='Νέο',
    short='Διαφημίσεις που φέρνουν μηνύματα, κλήσεις και ραντεβού από ανθρώπους της περιοχής σας.',
    desc=B('Στήσιμο καμπάνιας και διαφημίσεων', 'Στόχευση στην περιοχή και στο κοινό σας', 'Βίντεο και εικόνες με φωνή στα ελληνικά', 'Μηνιαία αναφορά: τι κοστίζει κάθε επαφή', 'Το ποσό διαφήμισης πηγαίνει απευθείας στη Meta (από 5 €/ημέρα)'),
    long='Στήνουμε και διαχειριζόμαστε τις διαφημίσεις σας στο Facebook και στο Instagram. Ξεκινάμε με μικρό ποσό, μετράμε τι φέρνει πραγματικές επαφές και βάζουμε τα χρήματα εκεί που αποδίδουν.',
    steps=L('Μια κλήση για τον στόχο σας', 'Φτιάχνουμε διαφημίσεις και καμπάνια', 'Τις παρακολουθούμε και τις βελτιώνουμε κάθε εβδομάδα', 'Κάθε μήνα σας στέλνουμε αναφορά'),
    priceNote='χρεώνεται ο 1ος μήνας · χωρίς δέσμευση')
add(id='ads', cat='ads', name='Google Ads', price=0, unit='month', icon='search', needsSite=True,
    short='Εμφανίζεστε πρώτοι όταν σας ψάχνουν στο Google. Στήσιμο 0 € και 1ος μήνας 0 €.',
    desc=B('Μέτρηση κάθε κλήσης και ραντεβού από διαφήμιση', 'Λέξεις που ψάχνουν οι πελάτες στην περιοχή σας', 'Εγγύηση 60 ημερών: αν δεν φέρει επαφές, δεν πληρώνετε εμάς', 'Το ποσό διαφήμισης πηγαίνει απευθείας στη Google (από 5 €/ημέρα)'),
    long='Όταν κάποιος γράφει στο Google αυτό που κάνετε, στην περιοχή σας, βλέπει πρώτα εσάς. Μετράμε κάθε κλήση και κάθε ραντεβού, ώστε να ξέρετε ακριβώς τι σας φέρνει η διαφήμιση.',
    steps=L('Βρίσκουμε τι ψάχνουν οι πελάτες σας', 'Στήνουμε την καμπάνια και τη μέτρηση κλήσεων', 'Τη βελτιώνουμε κάθε εβδομάδα', 'Κάθε μήνα σας στέλνουμε αναφορά'),
    priceNote='μετά 59 €/μήνα + ΦΠΑ')
# ---------- bundles (example prices) ----------
def bundle(id, name, price, inc, was, short, badge=None, needs=False):
    add(id=id, cat='bundles', kind='bundle', name=name, price=price, unit='month', icon='bundle', example=True, includes=inc, badge=badge,
        needsSite=needs, notWith=['social', 'meta', 'ads'] + [x for x in ['b-start', 'b-grow', 'b-full'] if x != id],
        short=short, compareAt=was, priceNote='χρεώνεται ο 1ος μήνας · χωρίς δέσμευση')
bundle('b-start', 'Ξεκίνημα', 10900, ['social:basic', 'meta'], 12800, 'Social Βασικό (8 αναρτήσεις) + Meta Ads.')
bundle('b-grow', 'Ανάπτυξη', 13900, ['social:growth', 'meta'], 15800, 'Social Ανάπτυξη (12 αναρτήσεις) + Meta Ads.', badge='Δημοφιλές')
bundle('b-full', 'Πλήρης προβολή', 17900, ['social:growth', 'meta', 'ads'], 21700, 'Social Ανάπτυξη + Meta Ads + Google Ads.', needs=True)
# ---------- add-ons ----------
add(id='form', cat='extras', group='Για την ιστοσελίδα', name='Φόρμα επικοινωνίας', price=5000, icon='mail', needsSite=True,
    short='Οι επισκέπτες σάς γράφουν και το λαμβάνετε στο e-mail σας.', desc=B('Με προστασία από spam', 'Έρχεται στο e-mail σας', 'Σύμφωνη με τον GDPR'))
add(id='articles', cat='extras', group='Για την ιστοσελίδα', name='Ενότητα άρθρων', price=7000, icon='pen', needsSite=True, notWith=['growth'],
    short='Γράφετε και δημοσιεύετε άρθρα μόνοι σας.', desc=B('Από το κινητό ή τον υπολογιστή', 'Κάθε άρθρο σε δική του σελίδα για το Google'))
add(id='panel', cat='extras', group='Για την ιστοσελίδα', name='Πίνακας διαχείρισης', price=18000, icon='sliders', needsSite=True,
    short='Αλλάζετε μόνοι σας κείμενα και φωτογραφίες.', desc=B('Χωρίς τεχνικές γνώσεις', 'Οι αλλαγές φαίνονται αμέσως'))
add(id='quiz', cat='extras', group='Για την ιστοσελίδα', name='Διαδραστικό τεστ', price=18000, icon='quiz', needsSite=True,
    short='Ο επισκέπτης απαντά σε λίγες ερωτήσεις — εσείς παίρνετε τις απαντήσεις.', desc=B('Οι απαντήσεις έρχονται στο e-mail σας', 'Ιδανικό για να φέρνει ραντεβού'))
add(id='calc', cat='extras', group='Για την ιστοσελίδα', name='Υπολογιστής κόστους', price=12000, icon='calc', needsSite=True, example=True,
    short='Ο επισκέπτης βλέπει μια εκτίμηση τιμής — κι εσείς παίρνετε το τηλέφωνό του.', desc=B('Με τις δικές σας τιμές', 'Κάθε εκτίμηση έρχεται στο e-mail σας'))
add(id='ai', cat='extras', group='Για την ιστοσελίδα', name='AI βοηθός', price=2900, unit='month', icon='ai', needsSite=True, example=True,
    short='Απαντά στη στιγμή, σε ελληνικά και αγγλικά — και σας στέλνει όσους ενδιαφέρονται.', desc=B('Μαθαίνει τις δικές σας υπηρεσίες', 'Σας στέλνει τα στοιχεία όσων ενδιαφέρονται'), priceNote='χρεώνεται ο 1ος μήνας')
add(id='gbp', cat='extras', group='Google & ραντεβού', name='Google Business Profile + NFC stand', price=9000, icon='pin',
    short='Πλήρες προφίλ στο Google Maps και stand για κριτικές με ένα άγγιγμα.', desc=B('Κατηγορίες, ώρες, φωτογραφίες, υπηρεσίες', 'Stand στο γραφείο σας: κριτική με ένα άγγιγμα του κινητού'))
add(id='booking', cat='extras', group='Google & ραντεβού', name='Online ραντεβού', price=500, unit='month', icon='cal',
    short='Δική σας σελίδα κρατήσεων και αυτόματες υπενθυμίσεις.', desc=B('Οι πελάτες κλείνουν μόνοι τους ώρα', 'Υπενθυμίσεις με e-mail'),
    variants=[{"id": "one", "name": "Ένας επαγγελματίας", "price": 500}, {"id": "team", "name": "Ομάδα", "price": 1500}], priceNote='χρεώνεται ο 1ος μήνας')
# ---------- existing clients ----------
add(id='changes', cat='clients', name='Αλλαγές σε ιστοσελίδα που είναι online', price=5000, unit='request', maxQty=5, icon='edit', needsSite=True,
    short='Ένα αίτημα μπορεί να έχει πολλές αλλαγές. Γίνονται μέσα σε 3 εργάσιμες.')
add(id='renew', cat='clients', name='Ανανέωση φιλοξενίας', price=13000, unit='year', listed=False, needsSite=True, img=None,
    short='Ένας ακόμα χρόνος για την ιστοσελίδα σας, με το domain μαζί.',
    variants=[{"id": "hosting", "name": "Φιλοξενία", "price": 13000}, {"id": "growth", "name": "Growth", "price": 47500}])
# ---------- more ----------
add(id='qr', cat='more', name='Ψηφιακό μενού QR', price=9000, icon='qr', example=True,
    short='Δίγλωσσο μενού με φωτογραφίες — αλλάζετε τιμές όποτε θέλετε.')
add(id='wedding', cat='more', name='Ιστοσελίδα γάμου / βάπτισης', price=9000, icon='heart', example=True,
    short='Ένα link στο προσκλητήριο: εκκλησία, χάρτης, δήλωση παρουσίας.')
add(id='custom', cat='more', name='Custom λογισμικό', price=0, icon='code', quote=True,
    short='Για επιχειρήσεις που πνίγονται σε Excel, τετράδια και Viber.')

for i, p in enumerate(P): p['order'] = i
cat = {"version": 1, "updatedAt": None, "vatDefault": 24,
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
