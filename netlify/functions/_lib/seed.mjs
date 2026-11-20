/* starting catalogue — written by tools/build.mjs from data/catalog.json. After the first save in the panel, the live catalogue lives in Netlify Blobs. */
export default {
 "schema": 7,
 "version": 1,
 "updatedAt": null,
 "vatDefault": 24,
 "categories": [
  {
   "id": "site",
   "name": "Ιστοσελίδες & E-shop",
   "desc": "Κατασκευή δωρεάν για ιστοσελίδες — η τιμή περιλαμβάνει φιλοξενία και domain name.",
   "order": 0
  },
  {
   "id": "social",
   "name": "Social Media & Διαφημίσεις",
   "desc": "Instagram, Facebook και Google που φέρνουν πελάτες. Μηνιαία συνδρομή, χωρίς δέσμευση.",
   "order": 1
  },
  {
   "id": "bundles",
   "name": "Πακέτα",
   "desc": "Social media και διαφημίσεις μαζί — σε καλύτερη τιμή.",
   "order": 2
  },
  {
   "id": "extras",
   "name": "Προσθήκες",
   "desc": "Για την ιστοσελίδα σας — νέα ή υπάρχουσα.",
   "order": 3
  },
  {
   "id": "more",
   "name": "Επιπλέον",
   "desc": "Για πελάτες μας και για ειδικές περιστάσεις.",
   "order": 4
  }
 ],
 "products": [
  {
   "id": "site",
   "cat": "site",
   "kind": "build",
   "name": "Ιστοσελίδα",
   "price": 13200,
   "unit": "year",
   "perMonth": true,
   "strike": "500 – 5.000 €",
   "badge": "Δημοφιλές",
   "short": "Σχεδιασμένη μόνο για εσάς. Κατασκευή δωρεάν — πληρώνετε μόνο τη φιλοξενία.",
   "desc": "• Κατασκευή δωρεάν (αξία 500 € – 5.000 €)\n• Domain name δώρο, φιλοξενία, SSL, backups\n• Έτοιμη σε 1–5 ημέρες — τη βλέπετε πρώτα\n• Απεριόριστες αλλαγές μέχρι να βγει online\n• Ελληνικά & Αγγλικά, SEO για Google και AI",
   "long": "Μια σύγχρονη ιστοσελίδα, σχεδιασμένη μόνο για εσάς — όχι από έτοιμο πρότυπο. Τη φτιάχνουμε με τα στοιχεία που ήδη έχετε (π.χ. το προφίλ σας στο Google) και τη βλέπετε έτοιμη μέσα σε 1–5 ημέρες.",
   "steps": "Πληρώνετε τον 1ο χρόνο φιλοξενίας\nΜας λέτε για την επιχείρησή σας ή μας στέλνετε ένα link\nΣε 1–5 ημέρες βλέπετε την ιστοσελίδα έτοιμη\nΚάνουμε όσες αλλαγές θέλετε και βγαίνει online",
   "priceNote": "Domain name δώρο",
   "variants": [
    {
     "id": "basic",
     "name": "Βασικό",
     "price": 13200,
     "note": "Φιλοξενία, domain, SSL, backups, υποστήριξη"
    },
    {
     "id": "growth",
     "name": "Growth",
     "price": 48000,
     "note": "+ 3 άρθρα τον μήνα για το Google, 1 αίτημα αλλαγών τον μήνα, μηνιαία αναφορά"
    }
   ],
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "SITE",
   "img": "assets/img/p/site.webp",
   "order": 0
  },
  {
   "id": "stay",
   "cat": "site",
   "kind": "build",
   "name": "Ιστοσελίδα καταλύματος",
   "price": 13200,
   "unit": "year",
   "perMonth": true,
   "strike": "500 – 5.000 €",
   "short": "Για βίλες, δωμάτια και διαμερίσματα — κρατήσεις απευθείας, χωρίς προμήθειες.",
   "desc": "• Κατασκευή δωρεάν, domain δώρο\n• Χώροι, φωτογραφίες, περιοχή, κριτικές επισκεπτών\n• Ελληνικά & Αγγλικά\n• Κουμπιά κράτησης σε φόρμα, e-mail και τηλέφωνο — ο επισκέπτης κλείνει απευθείας με εσάς\n• Το Α.Μ.Α. του καταλύματος, όπως ζητά ο νόμος",
   "long": "Για ιδιοκτήτες που θέλουν κρατήσεις κατευθείαν από τη δική τους σελίδα, χωρίς να δίνουν προμήθεια σε κάθε κράτηση.",
   "steps": "Μας στέλνετε το link από Booking ή Airbnb\nΠαίρνουμε φωτογραφίες, κείμενα και κριτικές από εκεί\nΣε 1–5 ημέρες βλέπετε την ιστοσελίδα έτοιμη\nΒγαίνει online στο δικό σας domain",
   "priceNote": "Domain name δώρο",
   "variants": [
    {
     "id": "direct",
     "name": "Απευθείας κρατήσεις",
     "price": 13200,
     "note": "Κράτηση με φόρμα, e-mail ή τηλέφωνο — χωρίς προμήθειες"
    },
    {
     "id": "cm",
     "name": "Με channel manager",
     "price": 13200,
     "note": "+ κρατήσεις online στη σελίδα σας, συγχρονισμός με Booking & Airbnb",
     "extras": [
      {
       "id": "setup",
       "name": "Στήσιμο channel manager",
       "price": 15000,
       "unit": "once"
      },
      {
       "id": "cm",
       "name": "Channel manager",
       "price": 2500,
       "unit": "month"
      }
     ]
    }
   ],
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "STAY",
   "img": "assets/img/p/stay.webp",
   "order": 1
  },
  {
   "id": "eshop",
   "cat": "site",
   "kind": "build",
   "name": "E-shop",
   "price": 69400,
   "example": true,
   "badge": "Νέο",
   "short": "Δικό σας ηλεκτρονικό κατάστημα — χωρίς προμήθειες σε πλατφόρμες.",
   "desc": "• Κατασκευή + 1ος χρόνος φιλοξενίας\n• Κάρτα, Apple Pay, Google Pay, IRIS\n• Τα χρήματα πάνε κατευθείαν σε εσάς\n• Ανεβάζουμε εμείς τα προϊόντα σας\n• Πίνακας για προϊόντα, τιμές, εκπτώσεις",
   "long": "Ένα κατάστημα που είναι δικό σας: χωρίς προμήθειες σε κάθε πώληση. Εμείς το στήνουμε, ανεβάζουμε τα προϊόντα και συνδέουμε τις πληρωμές· εσείς αλλάζετε τιμές και προϊόντα από τον πίνακα, όποτε θέλετε.",
   "steps": "Μας λέτε πόσα και ποια προϊόντα έχετε\nΣτήνουμε το κατάστημα και ανεβάζουμε τα προϊόντα\nΣυνδέουμε τις πληρωμές στον δικό σας λογαριασμό\nΣας δείχνουμε τον πίνακα σε μια σύντομη κλήση",
   "priceNote": "Από τον 2ο χρόνο 296 € / έτος",
   "later": "Φιλοξενία e-shop από τον 2ο χρόνο: 296 € / έτος",
   "unit": "once",
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "ESHOP",
   "img": "assets/img/p/eshop.webp",
   "order": 2
  },
  {
   "id": "qr",
   "cat": "site",
   "kind": "build",
   "name": "Ψηφιακό μενού QR",
   "price": 13200,
   "unit": "year",
   "perMonth": true,
   "example": true,
   "short": "Δίγλωσσο μενού με φωτογραφίες — αλλάζετε μόνοι σας πιάτα και τιμές.",
   "desc": "• Για καφέ, εστιατόρια, μπαρ\n• Ελληνικά & Αγγλικά, με φωτογραφίες\n• Πίνακας για να αλλάζετε μενού και τιμές όποτε θέλετε\n• QR για τα τραπέζια",
   "priceNote": "Ιστοσελίδα-μενού · domain δώρο",
   "extras": [
    {
     "id": "setup",
     "name": "Πίνακας αλλαγών μενού & τιμών",
     "price": 7000,
     "unit": "once"
    }
   ],
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "QR",
   "img": "assets/img/p/qr.webp",
   "order": 3
  },
  {
   "id": "wedding",
   "cat": "site",
   "name": "Ιστοσελίδα γάμου / βάπτισης",
   "price": 10000,
   "example": true,
   "short": "Ένα link στο προσκλητήριο: εκκλησία, χάρτης, δήλωση παρουσίας.",
   "desc": "• Δήλωση παρουσίας online\n• Χάρτης για εκκλησία και δεξίωση",
   "unit": "once",
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "WEDDING",
   "img": "assets/img/p/wedding.webp",
   "order": 4
  },
  {
   "id": "social",
   "cat": "social",
   "name": "Διαχείριση Social Media",
   "price": 5100,
   "unit": "month",
   "short": "Instagram & Facebook με την ταυτότητά σας — τα αναλαμβάνουμε όλα.",
   "desc": "• Reels, posts & carousels\n• Σχέδιο αναρτήσεων κάθε μήνα\n• Δεν χρειάζεται να μας στείλετε τίποτα\n• Μηνιαία αναφορά",
   "long": "Αναλαμβάνουμε το Instagram και το Facebook σας: ιδέες, κείμενα, σχέδια, reels και δημοσίευση — στο ύφος της επιχείρησής σας.",
   "steps": "Μια σύντομη κλήση για να γνωρίσουμε την επιχείρησή σας\nΣας στέλνουμε το σχέδιο του μήνα\nΔημοσιεύουμε εμείς, στις καλύτερες ώρες\nΚάθε μήνα σας στέλνουμε αναφορά",
   "priceNote": "Χωρίς δέσμευση",
   "variants": [
    {
     "id": "basic",
     "name": "8 αναρτήσεις",
     "price": 5100
    },
    {
     "id": "growth",
     "name": "12 αναρτήσεις",
     "price": 8100
    },
    {
     "id": "pro",
     "name": "16 αναρτήσεις",
     "price": 10200
    }
   ],
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "SOCIAL",
   "img": "assets/img/p/social.webp",
   "order": 5
  },
  {
   "id": "meta",
   "cat": "social",
   "name": "Meta Ads",
   "price": 8100,
   "unit": "month",
   "example": true,
   "short": "Διαφημίσεις σε Facebook & Instagram που φέρνουν μηνύματα και κλήσεις.",
   "desc": "• Στήσιμο καμπάνιας, κοινού και διαφημίσεων\n• Στόχευση στην περιοχή σας\n• Μηνιαία αναφορά αποτελεσμάτων\n• Το ποσό των διαφημίσεων δεν περιλαμβάνεται — πάει απευθείας στη Meta, από 5 € / ημέρα",
   "long": "Στήνουμε και διαχειριζόμαστε τις διαφημίσεις σας στο Facebook και στο Instagram, μετράμε τι φέρνει πραγματικές επαφές και βάζουμε τα χρήματα εκεί που αποδίδουν.",
   "steps": "Μια κλήση για τον στόχο σας\nΦτιάχνουμε διαφημίσεις και καμπάνια\nΤις βελτιώνουμε κάθε εβδομάδα\nΚάθε μήνα σας στέλνουμε αναφορά",
   "priceNote": "Χωρίς το ποσό των διαφημίσεων (από 5 € / ημέρα)",
   "extras": [
    {
     "id": "setup",
     "name": "Στήσιμο καμπάνιας",
     "price": 10000,
     "unit": "once"
    }
   ],
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "META",
   "img": "assets/img/p/meta.webp",
   "order": 6
  },
  {
   "id": "ads",
   "cat": "social",
   "name": "Google Ads",
   "price": 6100,
   "unit": "month",
   "needsSite": true,
   "ourSite": true,
   "short": "Εμφανίζεστε πρώτοι όταν σας ψάχνουν στο Google. Για ιστοσελίδες που φτιάξαμε εμείς.",
   "desc": "• Έρευνα λέξεων-κλειδιών και στήσιμο καμπάνιας\n• Μέτρηση κάθε κλήσης και ραντεβού\n• Προϋπόθεση: η ιστοσελίδα σας να είναι από εμάς\n• Το ποσό των διαφημίσεων δεν περιλαμβάνεται — πάει απευθείας στη Google, από 5 € / ημέρα",
   "long": "Όταν κάποιος γράφει στο Google αυτό που κάνετε, στην περιοχή σας, βλέπει πρώτα εσάς. Μετράμε κάθε κλήση και κάθε ραντεβού. Για ιστοσελίδες που έχουμε φτιάξει εμείς (ή που φτιάχνουμε τώρα).",
   "steps": "Βρίσκουμε τι ψάχνουν οι πελάτες σας\nΣτήνουμε την καμπάνια και τη μέτρηση κλήσεων\nΤη βελτιώνουμε κάθε εβδομάδα\nΚάθε μήνα σας στέλνουμε αναφορά",
   "priceNote": "Χωρίς το ποσό των διαφημίσεων (από 5 € / ημέρα)",
   "extras": [
    {
     "id": "setup",
     "name": "Έρευνα & στήσιμο",
     "price": 5000,
     "unit": "once"
    }
   ],
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "ADS",
   "img": "assets/img/p/ads.webp",
   "order": 7
  },
  {
   "id": "b-start",
   "cat": "bundles",
   "kind": "bundle",
   "name": "Πακέτο Ξεκίνημα",
   "price": 11200,
   "unit": "month",
   "example": true,
   "includes": [
    "social:basic",
    "meta"
   ],
   "badge": null,
   "needsSite": false,
   "ourSite": false,
   "notWith": [
    "social",
    "meta",
    "ads",
    "b-grow",
    "b-full"
   ],
   "short": "Social Media (8 αναρτήσεις) + Meta Ads.",
   "priceNote": "Χωρίς το ποσό των διαφημίσεων (από 5 € / ημέρα)",
   "extras": [
    {
     "id": "setup",
     "name": "Στήσιμο καμπανιών",
     "price": 10000,
     "unit": "once"
    }
   ],
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "B-START",
   "img": "assets/img/p/b-start.webp",
   "compareAt": 13200,
   "order": 8
  },
  {
   "id": "b-grow",
   "cat": "bundles",
   "kind": "bundle",
   "name": "Πακέτο Ανάπτυξη",
   "price": 14200,
   "unit": "month",
   "example": true,
   "includes": [
    "social:growth",
    "meta"
   ],
   "badge": "Δημοφιλές",
   "needsSite": false,
   "ourSite": false,
   "notWith": [
    "social",
    "meta",
    "ads",
    "b-start",
    "b-full"
   ],
   "short": "Social Media (12 αναρτήσεις) + Meta Ads.",
   "priceNote": "Χωρίς το ποσό των διαφημίσεων (από 5 € / ημέρα)",
   "extras": [
    {
     "id": "setup",
     "name": "Στήσιμο καμπανιών",
     "price": 10000,
     "unit": "once"
    }
   ],
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "B-GROW",
   "img": "assets/img/p/b-grow.webp",
   "compareAt": 16200,
   "order": 9
  },
  {
   "id": "b-full",
   "cat": "bundles",
   "kind": "bundle",
   "name": "Πακέτο Πλήρης προβολή",
   "price": 18300,
   "unit": "month",
   "example": true,
   "includes": [
    "social:growth",
    "meta",
    "ads"
   ],
   "badge": null,
   "needsSite": true,
   "ourSite": true,
   "notWith": [
    "social",
    "meta",
    "ads",
    "b-start",
    "b-grow"
   ],
   "short": "Social Media (12 αναρτήσεις) + Meta Ads + Google Ads.",
   "priceNote": "Χωρίς το ποσό των διαφημίσεων (από 5 € / ημέρα)",
   "extras": [
    {
     "id": "setup",
     "name": "Στήσιμο καμπανιών",
     "price": 15000,
     "unit": "once"
    }
   ],
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "B-FULL",
   "img": "assets/img/p/b-full.webp",
   "compareAt": 22300,
   "order": 10
  },
  {
   "id": "form",
   "cat": "extras",
   "name": "Φόρμα επικοινωνίας",
   "price": 5000,
   "needsSite": true,
   "short": "Οι επισκέπτες σάς γράφουν — το λαμβάνετε στο e-mail σας.",
   "desc": "• Με προστασία από spam\n• Έρχεται στο e-mail σας\n• Σύμφωνη με τον GDPR",
   "unit": "once",
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "FORM",
   "img": "assets/img/p/form.webp",
   "order": 11
  },
  {
   "id": "articles",
   "cat": "extras",
   "name": "Ενότητα άρθρων",
   "price": 7200,
   "needsSite": true,
   "short": "Γράφετε και δημοσιεύετε άρθρα μόνοι σας.",
   "desc": "• Από το κινητό ή τον υπολογιστή\n• Κάθε άρθρο σε δική του σελίδα για το Google",
   "unit": "once",
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "ARTICLES",
   "img": "assets/img/p/articles.webp",
   "order": 12
  },
  {
   "id": "panel",
   "cat": "extras",
   "name": "Πίνακας διαχείρισης",
   "price": 18400,
   "needsSite": true,
   "short": "Αλλάζετε μόνοι σας κείμενα και φωτογραφίες.",
   "desc": "• Χωρίς τεχνικές γνώσεις\n• Οι αλλαγές φαίνονται αμέσως",
   "unit": "once",
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "PANEL",
   "img": "assets/img/p/panel.webp",
   "order": 13
  },
  {
   "id": "quiz",
   "cat": "extras",
   "name": "Διαδραστικό τεστ",
   "price": 5000,
   "needsSite": true,
   "short": "Λίγες ερωτήσεις στον επισκέπτη — οι απαντήσεις έρχονται σε εσάς.",
   "desc": "• Οι απαντήσεις στο e-mail σας\n• Φέρνει ραντεβού",
   "unit": "once",
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "QUIZ",
   "img": "assets/img/p/quiz.webp",
   "order": 14
  },
  {
   "id": "ai",
   "cat": "extras",
   "name": "AI βοηθός",
   "price": 2500,
   "unit": "month",
   "needsSite": true,
   "example": true,
   "short": "Απαντά στη στιγμή, σε ελληνικά και αγγλικά, 24 ώρες το 24ωρο.",
   "desc": "• Μαθαίνει τις δικές σας υπηρεσίες\n• Σας στέλνει τα στοιχεία όσων ενδιαφέρονται",
   "priceNote": "Χωρίς δέσμευση",
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "AI",
   "img": "assets/img/p/ai.webp",
   "order": 15
  },
  {
   "id": "gbp",
   "cat": "extras",
   "name": "Google Maps + NFC stand",
   "price": 9200,
   "short": "Πλήρες προφίλ στο Google Maps και stand για κριτικές με ένα άγγιγμα.",
   "desc": "• Κατηγορίες, ώρες, φωτογραφίες, υπηρεσίες\n• Stand στο γραφείο σας: κριτική με ένα άγγιγμα του κινητού",
   "unit": "once",
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "GBP",
   "img": "assets/img/p/gbp.webp",
   "order": 16
  },
  {
   "id": "booking",
   "cat": "extras",
   "name": "Online ραντεβού",
   "price": 550,
   "unit": "month",
   "short": "Οι πελάτες κλείνουν μόνοι τους ώρα — με υπενθυμίσεις.",
   "desc": "• Δική σας σελίδα κρατήσεων\n• Υπενθυμίσεις με e-mail",
   "variants": [
    {
     "id": "one",
     "name": "1 άτομο",
     "price": 550
    },
    {
     "id": "team",
     "name": "Ομάδα",
     "price": 1600
    }
   ],
   "priceNote": "Χωρίς δέσμευση",
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "BOOKING",
   "img": "assets/img/p/booking.webp",
   "order": 17
  },
  {
   "id": "changes",
   "cat": "more",
   "name": "Αλλαγές σε ιστοσελίδα",
   "price": 5200,
   "unit": "request",
   "maxQty": 5,
   "needsSite": true,
   "short": "Για ιστοσελίδες που είναι ήδη online. Ένα αίτημα = όσες αλλαγές θέλετε.",
   "desc": "• Γίνονται μέσα σε 3 εργάσιμες\n• Γράφετε όλες τις αλλαγές σε ένα μήνυμα",
   "vat": 24,
   "active": true,
   "sku": "CHANGES",
   "img": "assets/img/p/changes.webp",
   "order": 18
  },
  {
   "id": "renew",
   "cat": "more",
   "name": "Ανανέωση φιλοξενίας",
   "price": 13200,
   "unit": "year",
   "perMonth": true,
   "needsSite": true,
   "link": "ananeosi.html",
   "short": "Ένας ακόμα χρόνος για την ιστοσελίδα σας, με το domain μαζί.",
   "variants": [
    {
     "id": "hosting",
     "name": "Βασικό",
     "price": 13200
    },
    {
     "id": "growth",
     "name": "Growth",
     "price": 48000
    }
   ],
   "vat": 24,
   "active": true,
   "maxQty": 1,
   "sku": "RENEW",
   "img": "assets/img/p/renew.webp",
   "order": 19
  }
 ],
 "coupons": [
  {
   "code": "ADVON10",
   "type": "pct",
   "value": 10,
   "min": 0,
   "from": null,
   "to": null,
   "maxUses": 0,
   "uses": 0,
   "active": true,
   "label": "Δοκιμαστικός κωδικός −10%"
  }
 ],
 "catSales": [],
 "settings": {
  "shopName": "Advon Media",
  "tagline": "Ό,τι χρειάζεται η επιχείρησή σας online.",
  "notifyEmail": "advonmd@gmail.com",
  "phone": "",
  "email": "advonmd@gmail.com",
  "pricesIncludeVat": false,
  "askInvoice": true,
  "payments": {
   "stripe": true,
   "viva": true,
   "bank": false
  },
  "bank": {
   "bankName": "",
   "iban": "",
   "holder": ""
  },
  "legal": {
   "name": "Advon Media",
   "afm": "",
   "doy": "",
   "address": "",
   "gemi": ""
  },
  "shipping": {
   "enabled": false,
   "flat": 0,
   "freeOver": 0
  },
  "notice": ""
 }
};
