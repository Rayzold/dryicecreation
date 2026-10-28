import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geologica/full.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { business, SITE_URL } from "@/lib/site";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ξηρός πάγος & Διοξείδιο του άνθρακα CO2 | Dry Ice Creation",
    template: "%s | Dry Ice Creation",
  },
  description:
    "Ξηρός πάγος & διοξείδιο του άνθρακα CO2 - Διανομή πανελλαδικά. Ανασυσκευασία - μεταφορές - παραδόσεις - εξαγωγές προϊόντων που απαιτούν ρύθμιση θερμοκρασίας.",
  applicationName: "Dry Ice Creation",
  // GitHub Pages preview (sub-path build) must stay out of search results.
  ...(process.env.NEXT_PUBLIC_BASE_PATH ? { robots: { index: false, follow: false } } : {}),
  openGraph: {
    type: "website",
    locale: "el_GR",
    siteName: "Dry Ice Creation",
    images: [{ url: "/media/2026/04/Dry-ice-Cocktails-3.jpg", width: 1920, height: 1080, alt: "Dry Ice Creation" }],
  },
  twitter: { card: "summary_large_image", site: "@dryicecreation" },
  icons: { icon: asset("/media/2017/09/Dry-Ice-Creation-Penguin-Orange-transparent-150x150.png") },
  verification: {
    google: "SV6FBpYaYjTT_hi3_20lODuzhEw_sI0bem47Luc99OY",
    other: { "msvalidate.01": "6725B7FC38C03856860D9D7272BA8148" },
  },
};

export const viewport: Viewport = {
  themeColor: "#061019",
  colorScheme: "dark",
};

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: business.name,
  legalName: business.legalName,
  url: SITE_URL,
  logo: `${SITE_URL}/media/2019/04/Dryicecreation_Logo.jpg`,
  image: `${SITE_URL}/media/2026/04/Dry-ice-Cocktails-3.jpg`,
  description: business.tagline,
  email: business.email,
  telephone: business.phones.map((p) => p.tel),
  foundingDate: "2013",
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address.street,
    addressLocality: business.address.area,
    postalCode: business.address.postalCode.replace(" ", ""),
    addressRegion: business.address.region,
    addressCountry: business.address.country,
  },
  areaServed: { "@type": "Country", name: "Greece" },
  openingHours: business.hours.map((h) => h.schema),
  sameAs: business.social.map((s) => s.url),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="el">
      <body className="flex min-h-dvh flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
