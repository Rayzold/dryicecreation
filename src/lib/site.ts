// Single source of truth for business details, navigation and the curated
// service / product / application lists used across the site.

export const SITE_URL = "https://dryicecreation.gr";

export const business = {
  name: "Dry Ice Creation",
  legalName: "DRY ICE CREATION Ι.Κ.Ε.",
  tagline: "Ξηρός πάγος, διοξείδιο του άνθρακα (CO₂) και υγρό άζωτο",
  email: "info@dryicecreation.gr",
  phones: [
    { label: "Γραφείο", display: "213 029 1900", tel: "+302130291900" },
    { label: "Κινητό", display: "694 852 8574", tel: "+306948528574" },
    { label: "Κινητό", display: "694 470 9776", tel: "+306944709776" },
  ],
  address: {
    street: "Αγίας Άννης 8 & Πέτρου Ράλλη",
    area: "Ταύρος",
    postalCode: "177 78",
    region: "Αττική",
    country: "GR",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Dry Ice Creation, Αγίας Άννης 8, Ταύρος 177 78"),
  hours: [
    { days: "Δευτέρα – Παρασκευή", time: "08:30 – 17:00", schema: "Mo-Fr 08:30-17:00" },
    { days: "Σάββατο", time: "09:30 – 14:30", schema: "Sa 09:30-14:30" },
  ],
  app: "https://play.google.com/store/apps/details?id=com.app.dryicecreationr",
  social: [
    { name: "Facebook", url: "https://www.facebook.com/dryicecreation" },
    { name: "YouTube", url: "https://www.youtube.com/user/dryicecreation" },
    { name: "LinkedIn", url: "https://gr.linkedin.com/in/dryicecreation" },
    { name: "X / Twitter", url: "https://twitter.com/dryicecreation" },
  ],
  stats: [
    { value: 1500, suffix: "+", label: "πελάτες σε όλη την Ελλάδα" },
    { value: 9000, suffix: "+", label: "παραγγελίες κάθε χρόνο" },
    { value: 95000, suffix: "+", label: "χιλιόμετρα στον δρόμο τον χρόνο" },
    { value: 4600, suffix: "+", label: "καφέδες για να τα προλάβουμε" },
  ],
};

export type Item = {
  title: string;
  short?: string;
  href: string;
  image?: string;
  tags?: string;
};

export const services: Item[] = [
  {
    title: "Διανομή ξηρού πάγου",
    short: "Pellets και blocks αρίστης ποιότητας στην πόρτα σου, αυθημερόν στην Αττική και σε όλη την Ελλάδα.",
    href: "/dianomi-xirou-pagou/",
    image: "/media/2017/10/Dry-Ice-Scoop.jpg",
    tags: "Pellets 3 / 16 mm, Blocks, Αυθημερόν",
  },
  {
    title: "Ανασυσκευασία & μεταφορές",
    short: "Συσκευασία και αεροπορική μεταφορά ευαίσθητων προϊόντων που χρειάζονται ψύξη ή κατάψυξη.",
    href: "/anasyskeyasia-metafores-dry-ice-courier/",
    image: "/media/2017/09/Dry-Ice-Bucket.jpg",
    tags: "Ψύξη, Κατάψυξη, Courier",
  },
  {
    title: "Αποστολές στο εξωτερικό",
    short: "Από την πόρτα σου μέχρι την πόρτα του παραλήπτη, σε κάθε χώρα, στη σωστή θερμοκρασία.",
    href: "/dry-ice-courier-apostoles-paradoseis-exoterikoy/",
    image: "/media/2017/09/Dry-Ice-For-Food.jpg",
    tags: "Τρόφιμα, Δείγματα, Φάρμακα",
  },
  {
    title: "Καθαρισμός με παγοβολή",
    short: "Χωρίς νερό, χημικά ή κατάλοιπα. Για επιφάνειες, τοίχους, αυτοκίνητα και βιομηχανικό εξοπλισμό.",
    href: "/katharismos-apolymansi-me-pagovoli/",
    image: "/media/2017/11/Dry-ice-blasting-for-industrial-cleaning.jpg",
    tags: "Dry ice blasting, Απολύμανση",
  },
  {
    title: "Εφέ καπνού, ομίχλης & κομφετί",
    short: "Χαμηλή ομίχλη και καπνός για γάμους, θέατρα, βιντεοκλίπ, ταινίες και παρουσιάσεις.",
    href: "/paragogi-efe-kapnou-omichlis-comfetti/",
    image: "/media/2017/11/Dry-ice-fog-effect-in-a-wedding-4.jpg",
    tags: "Γάμοι, Θέατρο, TV",
  },
];

export const products: Item[] = [
  {
    title: "MistyStix",
    short: "Το stick ανάδευσης με ξηρό πάγο που βγάζει ομίχλη από το ποτήρι, με ασφάλεια.",
    href: "/mistystix/",
    image: "/media/2026/04/Dry-ice-Cocktails-3.jpg",
  },
  {
    title: "Υγρό άζωτο",
    short: "Σε δεξαμενές διαφόρων μεγεθών για εργαστήρια, κουζίνες και βιομηχανία.",
    href: "/ygro-azoto/",
    image: "/media/2019/02/Δοχεία-υγρού-αζώτου-Dry-Ice-Creation.jpg",
  },
  {
    title: "Διοξείδιο του άνθρακα (CO₂)",
    short: "Σε αέρια ή υγρή μορφή, για κάθε βιομηχανική και εμπορική χρήση.",
    href: "/dioxidio-tou-anthraka-co2/",
    image: "/media/2017/11/Ξηρός-πάγος-και-βιομηχανικές-εφαρμογές.jpg",
  },
  {
    title: "Μηχανές παραγωγής ξηρού πάγου",
    short: "Pelletizers για παραγωγή ξηρού πάγου υψηλής ποιότητας στον χώρο σου.",
    href: "/michanes-paragogis-xirou-pagou/",
    image: "/media/2017/10/ASCO-Dry-Ice-Pelletizer.jpg",
  },
  {
    title: "Μηχανές παγοβολής",
    short: "Μηχανήματα ASCO για καθαρισμό δύσκολων επιφανειών και εξοπλισμού.",
    href: "/michanes-pagovolis-asco/",
    image: "/media/2017/10/ASCOJET-1708.jpg",
  },
  {
    title: "Μηχανές καπνού ξηρού πάγου",
    short: "Για χαμηλή ομίχλη σε εκδηλώσεις, τηλεόραση, κινηματογράφο και clubs.",
    href: "/michanes-paragogis-efe-kapnou-xirou-pagou/",
    image: "/media/2017/11/Wedding-low-fog-effect.jpg",
  },
  {
    title: "Δοχεία υγρού αζώτου",
    short: "Φιάλες μεταφοράς και αποθήκευσης 3, 10 ή 20 λίτρων από αλουμίνιο.",
    href: "/docheia-metaforas-amp-apothikeysis-ygrou-azotou/",
    image: "/media/2017/10/10-ygro-azwto.jpg",
  },
  {
    title: "Όπλο κομφετί",
    short: "Εκτόξευση κομφετί για πάρτι, clubs και σκηνικές παραγωγές.",
    href: "/oplo-comfetti/",
    image: "/media/2017/10/Comfetti-Gun.jpg",
  },
  {
    title: "Όπλο CO₂ (CO₂ Gun)",
    short: "Στήλες καπνού διοξειδίου για στιγμές που πρέπει να μείνουν.",
    href: "/oplo-dioxidiou-co2-gun/",
    image: "/media/2017/11/test.jpg",
  },
];

export const applications: Item[] = [
  {
    title: "Μεταφορές",
    short: "Τρόφιμα, φάρμακα και δείγματα σε ελεγχόμενη θερμοκρασία.",
    href: "/efarmoges-xirou-pagou-dioxidiou/metafores/",
    image: "/media/2017/11/Transportation.jpg",
  },
  {
    title: "HoReCa",
    short: "Ξενοδοχεία, εστιατόρια, café και bars.",
    href: "/efarmoges-xirou-pagou-dioxidiou/xenodochia-estiatoria-cafe-ho-re-ca/",
    image: "/media/2017/09/Dry-Ice-Cocktails.jpg",
  },
  {
    title: "Καθαρισμοί",
    short: "Τοίχοι, επιφάνειες, graffiti, βιομηχανικός εξοπλισμός.",
    href: "/efarmoges-xirou-pagou-dioxidiou/katharismos-tichon-epifanion-pagovoli-xirou-pagou/",
    image: "/media/2017/12/Removal-Of-Graffiti.jpg",
  },
  {
    title: "Θέατρα, TV & εκδηλώσεις",
    short: "Εφέ καπνού και χαμηλής ομίχλης στη σκηνή.",
    href: "/efarmoges-xirou-pagou-dioxidiou/theatra-tileoptikes-paragoges-ekdilosis/",
    image: "/media/2017/11/Dry-ice-fog-effect-in-a-wedding-2.jpg",
  },
  {
    title: "Οινοποιία",
    short: "Γρήγορη ψύξη σταφυλιών, χωρίς πρόωρη ζύμωση.",
    href: "/efarmoges-xirou-pagou-dioxidiou/inopiia/",
    image: "/media/2017/09/Armazem-Taylor-Foto-de-Semen-Kuzmin-52.jpg",
  },
  {
    title: "Φαρμακοβιομηχανία",
    short: "Φύλαξη και διανομή βιο-ιατρικών προϊόντων.",
    href: "/efarmoges-xirou-pagou-dioxidiou/farmako-viomichania/",
    image: "/media/2017/11/Dry-Ice-and-pharmaceuticals-industry.jpg",
  },
  {
    title: "Βιομηχανία τροφίμων",
    short: "Ακίνδυνο ψυκτικό με βακτηριοστατικές ιδιότητες.",
    href: "/efarmoges-xirou-pagou-dioxidiou/viomichania-trofimon/",
    image: "/media/2017/11/Ξηρός-πάγός-και-καταψυγμένα-τρόφιμα-1.jpg",
  },
];

export const reasons = [
  { title: "Παραγωγή κάθε μέρα", text: "Παράγουμε ξηρό πάγο καθημερινά, ώστε να φτάνει φρέσκος, χωρίς απώλειες από εξάχνωση." },
  { title: "Άνθρωποι που τον ξέρουν", text: "Μιλάς με ανθρώπους που δουλεύουν τον ξηρό πάγο χρόνια και ξέρουν τι χρειάζεται η εφαρμογή σου." },
  { title: "Ασφάλεια", text: "Προϊόντα και συσκευασίες που τηρούν όλους τους κανόνες ασφαλείας, με σωστή καθοδήγηση χρήσης." },
  { title: "Αξιοπιστία", text: "Οι μακροχρόνιες συνεργασίες μας είναι η καλύτερη απόδειξη ότι θα είμαστε εκεί όταν μας χρειαστείς." },
];

export type NavGroup = { label: string; href?: string; items?: Item[]; groups?: { label: string; items: Item[] }[] };

export const nav: NavGroup[] = [
  {
    label: "Ξηρός πάγος",
    groups: [
      {
        label: "Γνώρισέ τον",
        items: [
          { title: "Τι είναι ο ξηρός πάγος", href: "/ti-ine-o-xiros-pagos/" },
          { title: "Κανόνες ασφαλείας", href: "/kanones-asfalias/" },
          { title: "Συχνές ερωτήσεις", href: "/sychnes-erotisis/" },
          { title: "Γκαλερί", href: "/gallery/" },
        ],
      },
      {
        label: "Εφαρμογές",
        items: [{ title: "Όλες οι εφαρμογές", href: "/efarmoges-xirou-pagou-dioxidiou/" }, ...applications],
      },
    ],
  },
  { label: "Υπηρεσίες", items: services },
  { label: "Προϊόντα", items: products },
  { label: "Παγοβολή", href: "/katharismos-apolymansi-me-pagovoli/" },
  { label: "Νέα", href: "/nea/" },
  {
    label: "Εταιρεία",
    items: [
      { title: "Ποιοι είμαστε", href: "/about-dry-ice-creation/" },
      { title: "Η πορεία μας", href: "/i-poria-mas/" },
      { title: "Παραγγελίες & διανομές", href: "/parangelies-dianomes-ypiresies/" },
      { title: "Επικοινωνία", href: "/epikinonise-mazi-mas/" },
    ],
  },
];

export const footerLinks: Item[] = [
  { title: "Ποιοι είμαστε", href: "/about-dry-ice-creation/" },
  { title: "Νέα", href: "/nea/" },
  { title: "Διανομές", href: "/dianomi-xirou-pagou/" },
  { title: "Συχνές ερωτήσεις", href: "/sychnes-erotisis/" },
  { title: "Γκαλερί", href: "/gallery/" },
  { title: "Επικοινωνία", href: "/epikinonise-mazi-mas/" },
  { title: "Πολιτική απορρήτου", href: "/privacy-policy/" },
  { title: "Όροι χρήσης", href: "/terms-of-use/" },
  { title: "Πολιτική cookies", href: "/oookie-policy/" },
];

// Old URLs that the WordPress site linked to and still get traffic → canonical path.
export const legacyRedirects: Record<string, string> = {
  "/ypiresies/dianomi-xirou-pagou/": "/dianomi-xirou-pagou/",
  "/ypiresies-katharismou-apolymansis-pagovoli/": "/katharismos-apolymansi-me-pagovoli/",
  "/anasyskevasia-metafores/": "/anasyskeyasia-metafores-dry-ice-courier/",
  "/home/apostoles-paradosis-exoterikou/": "/dry-ice-courier-apostoles-paradoseis-exoterikoy/",
  "/proionta/mistystix/": "/mistystix/",
  "/proionta/michanes-paragogis-xirou-pagou/": "/michanes-paragogis-xirou-pagou/",
  "/proionta/ygro-azoto/": "/ygro-azoto/",
  "/proionta/dioxidio-tou-anthraka-co2/": "/dioxidio-tou-anthraka-co2/",
  "/home/proionta/oplo-comfetti/": "/oplo-comfetti/",
  "/home/proionta/oplo-dioxidiou-co2-gun/": "/oplo-dioxidiou-co2-gun/",
  "/test-2/": "/",
  "/michanes-paragogis-kapnou-xirou-pagou/": "/michanes-paragogis-efe-kapnou-xirou-pagou/",
  "/promotion/": "/nea/",
  "/anakinosi/": "/anakoinwseis/",
  "/arthro/": "/arthra/",
};

// Which section a path belongs to (drives breadcrumbs, sidebar and related links)
export function sectionOf(path: string): { label: string; href: string; items: Item[] } | null {
  if (path.startsWith("/efarmoges-xirou-pagou-dioxidiou/") && path !== "/efarmoges-xirou-pagou-dioxidiou/")
    return { label: "Εφαρμογές", href: "/efarmoges-xirou-pagou-dioxidiou/", items: applications };
  if (services.some((s) => s.href === path)) return { label: "Υπηρεσίες", href: "/#ypiresies", items: services };
  if (products.some((s) => s.href === path)) return { label: "Προϊόντα", href: "/#proionta", items: products };
  const company = nav.find((n) => n.label === "Εταιρεία")!.items!;
  if (company.some((s) => s.href === path)) return { label: "Εταιρεία", href: "/about-dry-ice-creation/", items: company };
  const learn = nav[0].groups![0].items;
  if (learn.some((s) => s.href === path)) return { label: "Ξηρός πάγος", href: "/ti-ine-o-xiros-pagos/", items: learn };
  return null;
}

// Curated short title / image for any path that appears in navigation
export function curated(path: string): Item | undefined {
  const all: Item[] = [
    ...services,
    ...products,
    ...applications,
    ...nav.flatMap((g) => [...(g.items || []), ...(g.groups || []).flatMap((x) => x.items)]),
    ...footerLinks,
  ];
  return all.find((i) => i.href === path);
}
