# Dry Ice Creation — νέο website

Ανανεωμένο site για το [dryicecreation.gr](https://dryicecreation.gr), μεταφορά από WordPress (Kallyas, 2017) σε στατικό Next.js.

- **Stack:** Next.js 16 (static export), React 19, Tailwind CSS 4, [React Bits](https://reactbits.dev) (LiquidEther, BlurText, CountUp, SpotlightCard, Masonry)
- **Γραμματοσειρά:** Geologica (self-hosted μέσω Fontsource, πλήρη ελληνικά)
- **URLs:** ίδια slugs με το WordPress (`trailingSlash: true`) ώστε να μη χαθεί το SEO. Παλιά aliases (π.χ. `/proionta/mistystix/`) έχουν redirect pages.
- **SEO:** meta/OG ανά σελίδα, `sitemap.xml`, `robots.txt`, JSON-LD (LocalBusiness, BreadcrumbList, FAQPage, BlogPosting)

## Ανάπτυξη

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # στατικό export στο ./out
```

## Περιεχόμενο

Το περιεχόμενο προέρχεται από το παλιό site:

1. `.github/workflows/scrape.yml` (χειροκίνητο) κατεβάζει HTML/API/εικόνες στο `scrape-output/` και `public/media/`
2. `node scripts/extract-content.mjs` → καθαρό JSON στο `src/content/pages.json`
3. `node scripts/optimize-media.mjs` → συμπίεση εικόνων (ίδια paths)

Στοιχεία επιχείρησης, μενού, υπηρεσίες/προϊόντα/εφαρμογές: `src/lib/site.ts`.

## Φόρμα επικοινωνίας

Στέλνει μέσω [Web3Forms](https://web3forms.com) (δωρεάν). Δημιουργείς access key για το `info@dryicecreation.gr` και το βάζεις:

- GitHub: Settings → Secrets and variables → Actions → `WEB3FORMS_KEY`
- Τοπικά: `.env.local` → `NEXT_PUBLIC_WEB3FORMS_KEY=...`

Χωρίς key, η φόρμα ανοίγει το mail app του επισκέπτη με προσυμπληρωμένο μήνυμα.

## Deploy

- **Preview:** `.github/workflows/deploy.yml` → GitHub Pages στο `/dryicecreation/` (noindex). Χρειάζεται Settings → Pages → Source: *GitHub Actions*.
- **Production (dryicecreation.gr):** build χωρίς `NEXT_PUBLIC_BASE_PATH`, ανέβασμα του `out/` σε οποιοδήποτε static hosting.

## Άδειες

Τα React Bits components στο `src/components/reactbits/` είναι MIT + Commons Clause (δωρεάν και για εμπορική χρήση) — βλ. `LICENSE-reactbits.md`.
