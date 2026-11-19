# python3 tools/seed-catalog.py  →  data/catalog.json (the STARTING catalogue).
# Prices = advonmedia.com (Nov 2026). «example: True» = suggested by Claude, shown with a yellow badge in the panel.
import json

B = lambda *xs: '\n'.join('• ' + x for x in xs)
cats = [
    {"id": "build", "name": "Τι θα φτιάξουμε", "desc": "Διαλέξτε ένα — ή πείτε μας ότι έχετε ήδη ιστοσελίδα μαζί μας."},
    {"id": "hosting", "name": "Φιλοξενία", "desc": "Απαραίτητη για να είναι η σελίδα σας online. Το domain name είναι δώρο."},
    {"id": "extras", "name": "Προσθήκες", "desc": "Ό,τι χρειάζεται ακόμα η σελίδα σας, με μία πληρωμή."},
    {"id": "grow", "name": "Προβολή κάθε μήνα", "desc": "Να σας βρίσκουν, να σας εμπιστεύονται — και να σας καλούν."},
    {"id": "clients", "name": "Για πελάτες μας", "desc": "Για ιστοσελίδες που έχουμε ήδη φτιάξει."},
    {"id": "more", "name": "Περισσότερες λύσεις", "desc": "Λύσεις που στήνουμε στα μέτρα σας."},
]
P = []
def add(**k):
    k.setdefault('unit', 'once'); k.setdefault('vat', 24); k.setdefault('active', True); k.setdefault('maxQty', 1)
    k.setdefault('sku', k['id'].upper()); P.append(k)

HOST_SITE = ['hosting', 'growth']
# ---------- step 1: builds ----------
add(id='site', cat='build', kind='build', name='Ιστοσελίδα επαγγελματία', price=0, icon='site', featured=True,
    short='Δωρεάν κατασκευή. Πληρώνετε μόνο τη φιλοξενία — δώρο το domain name.',
    desc=B('Τη βλέπετε πρώτα έτοιμη, σε 1–5 ημέρες', 'Απεριόριστες αλλαγές μέχρι να βγει online', 'Ελληνικά & Αγγλικά, πρώτα για κινητό', 'SEO για το Google και τις αναζητήσεις μέσω AI'),
    priceNote='αξία κατασκευής 700 € – 5.000 €', requires=HOST_SITE)
add(id='eshop', cat='build', kind='build', name='E-shop', price=39000, icon='shop', badge='Νέο',
    short='Δικό σας κατάστημα με πληρωμές με κάρτα, IRIS, Apple Pay — και εύκολο πίνακα διαχείρισης.',
    desc=B('Τα χρήματα πάνε κατευθείαν στον δικό σας λογαριασμό', 'Προϊόντα, τιμές, εκπτώσεις και κουπόνια από το κινητό', 'Ανεβάζουμε εμείς όλα τα προϊόντα σας', 'Φτιαγμένο πρώτα για κινητό, με SEO'),
    variants=[{"id": "half", "name": "Προκαταβολή 50% — ξεκινάμε αμέσως", "price": 19500}, {"id": "full", "name": "Ολόκληρο το ποσό", "price": 39000}],
    requires=['eshop-hosting'])
add(id='stay', cat='build', kind='build', name='Ιστοσελίδα καταλύματος', price=0, icon='stay',
    short='Για βίλες, δωμάτια και διαμερίσματα — με κρατήσεις χωρίς προμήθειες.',
    desc=B('Χώροι, φωτογραφίες, περιοχή, κριτικές επισκεπτών', 'Ελληνικά & Αγγλικά', 'Το Α.Μ.Α. του καταλύματος, όπως ζητά ο νόμος'),
    variants=[{"id": "p1", "name": "Με κουμπιά κράτησης σε Booking / Airbnb", "price": 0},
              {"id": "p2", "name": "+ ημερολόγιο διαθεσιμότητας & αίτημα κράτησης", "price": 10000},
              {"id": "p3", "name": "+ δική σας μηχανή κρατήσεων με channel manager", "price": 19000, "requires": ["beds24"]}],
    requires=HOST_SITE)
# ---------- step 2: hosting (required) ----------
add(id='hosting', cat='hosting', kind='hosting', name='Φιλοξενία', price=13000, unit='year', featured=True,
    short='10,83 €/μήνα — τιμολογείται ως 130 € τον χρόνο.',
    desc=B('Domain name δωρεάν — περιλαμβάνεται', 'Φιλοξενία σε παγκόσμιο δίκτυο (CDN)', 'Πιστοποιητικό ασφαλείας SSL', 'Αυτόματα backups και τακτικός έλεγχος', 'Τεχνική υποστήριξη'))
add(id='growth', cat='hosting', kind='hosting', name='Growth', price=47500, unit='year', badge='Νέο',
    short='39,58 €/μήνα — όλα της Φιλοξενίας, και η σελίδα σας μεγαλώνει κάθε μήνα.',
    desc=B('Όλα όσα περιλαμβάνει η Φιλοξενία', '3 άρθρα κάθε μήνα, γραμμένα για το Google', 'Ενότητα άρθρων χωρίς επιπλέον χρέωση', '1 αίτημα αλλαγών κάθε μήνα χωρίς χρέωση', 'Μέτρηση κλικ στο τηλέφωνο, μηνιαία αναφορά', 'Προτεραιότητα στις αλλαγές'))
add(id='eshop-hosting', cat='hosting', kind='hosting', name='Φιλοξενία e-shop', price=29000, unit='year', example=True,
    short='24,17 €/μήνα — τιμολογείται ως 290 € τον χρόνο.',
    desc=B('Domain name δωρεάν', 'Οι πληρωμές να δουλεύουν πάντα σωστά', 'Ασφάλεια, backups, τεχνική υποστήριξη', 'Ο πίνακας διαχείρισης χωρίς όριο αλλαγών'))
add(id='beds24', cat='hosting', kind='hosting', name='Φιλοξενία + channel manager', price=39000, unit='year', example=True,
    short='Ιστοσελίδα, φιλοξενία και συγχρονισμός με Booking, Airbnb, Expedia.',
    desc=B('Ένα ημερολόγιο, καμία διπλοκράτηση', 'Κρατήσεις στη σελίδα σας χωρίς προμήθειες', 'Φιλοξενία και domain name μέσα'))
# ---------- step 3: extras (one payment) ----------
add(id='form', cat='extras', name='Φόρμα επικοινωνίας', price=5000, icon='mail', needsSite=True,
    short='Οι επισκέπτες σάς γράφουν και το λαμβάνετε στο e-mail σας.')
add(id='articles', cat='extras', name='Ενότητα άρθρων / σεμιναρίων', price=7000, icon='pen', needsSite=True, notWith=['growth'],
    short='Γράφετε και δημοσιεύετε άρθρα μόνοι σας.')
add(id='panel', cat='extras', name='Πίνακας διαχείρισης', price=18000, icon='sliders', needsSite=True,
    short='Αλλάζετε μόνοι σας κείμενα και φωτογραφίες.')
add(id='gbp', cat='extras', name='Παρουσία στο Google + NFC stand', price=9000, icon='pin', needsSite=False,
    short='Πλήρες προφίλ στο Google Maps και stand για κριτικές με ένα άγγιγμα.')
add(id='quiz', cat='extras', name='Διαδραστικό τεστ / ερωτηματολόγιο', price=18000, icon='quiz', needsSite=True,
    short='Ο επισκέπτης απαντά σε λίγες ερωτήσεις — εσείς παίρνετε τις απαντήσεις.')
add(id='calc', cat='extras', name='Υπολογιστής κόστους', price=12000, icon='calc', needsSite=True, example=True,
    short='Ο επισκέπτης βλέπει μια εκτίμηση τιμής — κι εσείς παίρνετε το τηλέφωνό του.')
# ---------- monthly ----------
add(id='social', cat='grow', name='Social media', price=4900, unit='month', icon='social',
    short='Instagram & Facebook με την ταυτότητά σας — χωρίς να μας δώσετε κωδικούς.',
    desc=B('Reels με υπότιτλους, posts & carousels', 'Δεν χρειάζεται να μας στείλετε τίποτα', 'Πρόσβαση συνεργάτη που αφαιρείτε με ένα κλικ', 'Μηνιαία γραπτή αναφορά'),
    variants=[{"id": "basic", "name": "Βασικό · 8 posts", "price": 4900}, {"id": "growth", "name": "Ανάπτυξη · 12 posts", "price": 7900}, {"id": "pro", "name": "Pro · 16 posts", "price": 9900}],
    priceNote='χρεώνεται ο 1ος μήνας · χωρίς δέσμευση')
add(id='ads', cat='grow', name='Google Ads', price=0, unit='month', icon='ads', needsSite=True,
    short='Στήσιμο 0 € και 1ος μήνας διαχείρισης 0 €. Εγγύηση 60 ημερών.',
    desc=B('Μέτρηση κάθε κλήσης και ραντεβού από διαφήμιση', 'Αν δεν φέρει επαφές, δεν πληρώνετε εμάς', 'Το ποσό διαφήμισης πηγαίνει απευθείας στη Google (από 5 €/ημέρα)'),
    priceNote='μετά 59 €/μήνα + ΦΠΑ')
add(id='booking', cat='grow', name='Online ραντεβού', price=500, unit='month', icon='cal', needsSite=False,
    short='Δική σας σελίδα κρατήσεων και αυτόματες υπενθυμίσεις.',
    variants=[{"id": "one", "name": "Ένας επαγγελματίας", "price": 500}, {"id": "team", "name": "Ομάδα", "price": 1500}],
    priceNote='χρεώνεται ο 1ος μήνας')
add(id='ai', cat='grow', name='AI βοηθός ιστοσελίδας', price=2900, unit='month', icon='ai', needsSite=True, example=True,
    short='Απαντά στη στιγμή, στα ελληνικά και στα αγγλικά — και σας στέλνει τα στοιχεία όσων ενδιαφέρονται.',
    priceNote='χρεώνεται ο 1ος μήνας')
# ---------- existing clients ----------
add(id='changes', cat='clients', name='Αλλαγές σε ιστοσελίδα που είναι online', price=5000, unit='request', maxQty=5, icon='edit', needsSite=True,
    short='Ένα αίτημα μπορεί να έχει πολλές αλλαγές. Γίνονται μέσα σε 3 εργάσιμες.')
add(id='renew', cat='clients', name='Ανανέωση φιλοξενίας', price=13000, unit='year', listed=False, needsSite=True,
    short='Ένας ακόμα χρόνος για την ιστοσελίδα σας, με το domain μαζί.',
    variants=[{"id": "hosting", "name": "Φιλοξενία", "price": 13000}, {"id": "growth", "name": "Growth", "price": 47500}])
# ---------- more (quote or example prices) ----------
add(id='qr', cat='more', name='Ψηφιακό μενού QR', price=9000, icon='qr', example=True,
    short='Δίγλωσσο μενού με φωτογραφίες — αλλάζετε τιμές όποτε θέλετε.')
add(id='wedding', cat='more', name='Ιστοσελίδα γάμου / βάπτισης', price=9000, icon='heart', example=True,
    short='Ένα link στο προσκλητήριο: εκκλησία, χάρτης, δήλωση παρουσίας.')
add(id='custom', cat='more', name='Custom μικρό λογισμικό', price=0, icon='code', quote=True,
    short='Για επιχειρήσεις που πνίγονται σε Excel, τετράδια και Viber.')

for i, p in enumerate(P): p['order'] = i
cat = {"version": 1, "updatedAt": None, "vatDefault": 24,
       "categories": [dict(c, order=i) for i, c in enumerate(cats)], "products": P,
       "coupons": [{"code": "ADVON10", "type": "pct", "value": 10, "min": 0, "from": None, "to": None, "maxUses": 0, "uses": 0, "active": True, "label": "Δοκιμαστικός κωδικός −10%"}],
       "catSales": [],
       "settings": {"shopName": "Advon Media", "tagline": "Η επιχείρησή σας online. Σε τρία βήματα.",
                    "notifyEmail": "advonmd@gmail.com", "phone": "", "email": "advonmd@gmail.com",
                    "pricesIncludeVat": False, "askInvoice": True,
                    "payments": {"stripe": True, "viva": True, "bank": False},
                    "bank": {"bankName": "", "iban": "", "holder": ""},
                    "legal": {"name": "Advon Media", "afm": "", "doy": "", "address": "", "gemi": ""},
                    "shipping": {"enabled": False, "flat": 0, "freeOver": 0}, "notice": ""}}
json.dump(cat, open('data/catalog.json', 'w'), ensure_ascii=False, indent=1)
print(len(P), 'products')
