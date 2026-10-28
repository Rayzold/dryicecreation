import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allPages, cleanTitle, formatDate, getPage, postImage, posts, type Page } from "@/lib/content";
import { applications, business, curated, legacyRedirects, reasons, sectionOf } from "@/lib/site";
import { asset } from "@/lib/asset";
import { PageHero, type Crumb } from "@/components/page/PageHero";
import { Prose } from "@/components/page/Prose";
import { Sidebar } from "@/components/page/Sidebar";
import { Faq } from "@/components/page/Faq";
import { Timeline } from "@/components/page/Timeline";
import { GalleryView } from "@/components/page/GalleryView";
import { ContactBand } from "@/components/ContactBand";
import { PostCard } from "@/components/PostCard";
import { Icon } from "@/components/Icon";

export const dynamicParams = false;

type Params = { slug: string[] };

const toPath = (slug: string[]) => "/" + slug.map(decodeURIComponent).join("/") + "/";

export function generateStaticParams(): Params[] {
  const paths = new Set([...allPages.filter((p) => p.type !== "home").map((p) => p.path), ...Object.keys(legacyRedirects)]);
  return [...paths].map((p) => ({ slug: p.split("/").filter(Boolean) }));
}

const LEGAL = new Set(["/privacy-policy/", "/terms-of-use/", "/oookie-policy/"]);
const NEWS: Record<string, { title: string; category?: string }> = {
  "/nea/": { title: "Νέα" },
  "/anakoinwseis/": { title: "Ανακοινώσεις", category: "Ανακοίνωση" },
  "/arthra/": { title: "Άρθρα", category: "Άρθρο" },
};

function heroImageOf(p: Page): string | null {
  if (LEGAL.has(p.path) || NEWS[p.path]) return null;
  if (p.type === "post") return null;
  return curated(p.path)?.image || p.images[0]?.src || p.ogImage || null;
}

function leadOf(p: Page): string {
  return p.description
    .split(/(?<=[.!;])\s+/)
    .filter((s) => !/κλικ|Πάτα|Πατήστε|Διάβασε εδώ|Είσαι επαγγελματίας|Μάθε περισσότερα/i.test(s))
    .join(" ")
    .replace(/\s*\.\.\.$/, ".")
    .trim();
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const path = toPath((await params).slug);
  const target = legacyRedirects[path];
  if (target) return { title: "Μεταφέρθηκε", robots: { index: false }, alternates: { canonical: target } };
  const p = getPage(path);
  if (!p) return {};
  const title = p.seoTitle.replace(/\s*\|\s*Dry Ice Creation\s*$/i, "") || cleanTitle(p.title);
  const img = (p.type === "post" ? postImage(p) : heroImageOf(p)) || undefined;
  return {
    title,
    description: p.description || undefined,
    alternates: { canonical: path },
    openGraph: {
      type: p.type === "post" ? "article" : "website",
      title,
      description: p.description || undefined,
      url: path,
      ...(img ? { images: [{ url: img }] } : {}),
      ...(p.type === "post" && p.date ? { publishedTime: p.date } : {}),
    },
  };
}

export default async function InnerPage({ params }: { params: Promise<Params> }) {
  const path = toPath((await params).slug);

  const target = legacyRedirects[path];
  if (target) return <Redirect to={target} />;

  const page = getPage(path);
  if (!page) notFound();

  if (page.type === "post") return <PostTemplate page={page} />;
  if (NEWS[path]) return <NewsTemplate path={path} />;
  if (path === "/sychnes-erotisis/") return <FaqTemplate page={page} />;
  if (path === "/gallery/") return <GalleryTemplate page={page} />;
  if (path === "/i-poria-mas/") return <TimelineTemplate page={page} />;
  if (path === "/epikinonise-mazi-mas/") return <ContactTemplate page={page} />;
  if (path === "/efarmoges-xirou-pagou-dioxidiou/") return <ApplicationsTemplate page={page} />;
  if (path === "/about-dry-ice-creation/") return <AboutTemplate page={page} />;
  if (LEGAL.has(path)) return <LegalTemplate page={page} />;
  return <ArticleTemplate page={page} />;
}

/* ── Templates ────────────────────────────────────────────── */

function crumbsFor(p: Page): Crumb[] {
  const s = sectionOf(p.path);
  const c: Crumb[] = s ? [{ label: s.label, href: s.href }] : [];
  return [...c, { label: curated(p.path)?.title || cleanTitle(p.title), href: p.path }];
}

function stripImage(html: string, src: string | null) {
  if (!src) return html;
  const esc = src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(new RegExp(`<p>(?:<a[^>]*>)?<img[^>]*src="${esc}"[^>]*>(?:</a>)?</p>|<img[^>]*src="${esc}"[^>]*>`), "");
}

function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function Videos({ srcs, poster }: { srcs: string[]; poster?: string }) {
  if (!srcs.length) return null;
  return (
    <div className="mt-12 grid gap-6">
      {srcs.map((v) => (
        <video
          key={v}
          controls
          preload="none"
          playsInline
          poster={asset(v.replace(/\.mp4$/, "-poster.jpg")) || poster}
          className="w-full rounded-[20px] border frost-line bg-abyss-2"
        >
          <source src={asset(v)} type="video/mp4" />
        </video>
      ))}
    </div>
  );
}

function ArticleTemplate({ page }: { page: Page }) {
  const hero = heroImageOf(page);
  const section = sectionOf(page.path);
  return (
    <>
      <PageHero title={cleanTitle(page.title)} lead={leadOf(page)} crumbs={crumbsFor(page)} image={hero} />
      <Wrap className="grid gap-14 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article>
          <Prose html={stripImage(page.html, hero)} />
          <Videos srcs={page.videos} />
        </article>
        <Sidebar current={page.path} section={section} />
      </Wrap>
      <ContactBand title={section?.label === "Προϊόντα" ? `Ενδιαφέρεσαι για ${lowerFirst(curated(page.path)?.title || cleanTitle(page.title))};` : undefined} />
    </>
  );
}

function lowerFirst(s: string) {
  // Keep acronyms/brand names (MistyStix, CO2) as they are
  return /^[A-ZΑ-Ω]{2}|^[A-Z]/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
}

function LegalTemplate({ page }: { page: Page }) {
  return (
    <>
      <PageHero title={cleanTitle(page.title)} crumbs={[{ label: cleanTitle(page.title), href: page.path }]} />
      <Wrap className="py-16 sm:py-20">
        <Prose html={page.html} />
      </Wrap>
    </>
  );
}

function FaqTemplate({ page }: { page: Page }) {
  return (
    <>
      <PageHero
        title="Συχνές ερωτήσεις για τον ξηρό πάγο"
        lead="Ό,τι ρωτάνε συνήθως όσοι χρησιμοποιούν ξηρό πάγο για πρώτη φορά: πόσο κρατάει, πόσο χρειάζεσαι, πώς τον αποθηκεύεις με ασφάλεια."
        crumbs={crumbsFor(page)}
      />
      <Wrap className="grid gap-14 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Faq items={page.faq || []} />
        <Sidebar current={page.path} section={sectionOf(page.path)} />
      </Wrap>
      <ContactBand title="Δεν βρήκες την απάντηση;" />
    </>
  );
}

function GalleryTemplate({ page }: { page: Page }) {
  return (
    <>
      <PageHero title="Γκαλερί" lead="Φωτογραφίες και βίντεο από εφέ καπνού, χαμηλής ομίχλης, κομφετί και κοκτέιλ με MistyStix." crumbs={crumbsFor(page)} />
      <Wrap className="py-16 sm:py-20">
        <GalleryView items={page.gallery || []} />
      </Wrap>
      <ContactBand title="Θέλεις κάτι τέτοιο στην εκδήλωσή σου;" />
    </>
  );
}

function TimelineTemplate({ page }: { page: Page }) {
  const extra = [
    {
      year: "2020",
      title: "Νο1 στην Ελλάδα",
      text: "Οι χρονιές 2019 και 2020 μας έκαναν την Νο1 εταιρεία παραγωγής και διακίνησης ξηρού πάγου στην Ελλάδα.",
      href: "/no-1-etairia-paragogis-kai-diakinisis-xiroy-pagoy-stin-ellada/",
    },
    {
      year: "2021",
      title: "Συνέντευξη στην ASCO",
      text: "Η ASCO συζήτησε με τον γενικό διευθυντή μας για την αγορά του ξηρού πάγου στην Ελλάδα και τις προοπτικές της.",
      href: "/being-interviewed-by-asco/",
    },
  ];
  return (
    <>
      <PageHero title="Η πορεία μας" lead="Από την ίδρυση το 2013 μέχρι σήμερα." crumbs={crumbsFor(page)} />
      <Wrap className="grid gap-14 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Timeline items={[...(page.timeline || []), ...extra]} />
        <Sidebar current={page.path} section={sectionOf(page.path)} />
      </Wrap>
    </>
  );
}

function ContactTemplate({ page }: { page: Page }) {
  return (
    <>
      <PageHero
        title="Επικοινωνία"
        lead="Για ξηρό πάγο, διοξείδιο του άνθρακα (CO₂) και υγρό άζωτο. Πάρε τηλέφωνο ή στείλε μας μήνυμα."
        crumbs={crumbsFor(page)}
      />
      <ContactBand title="Είμαστε εδώ" />
    </>
  );
}

function ApplicationsTemplate({ page }: { page: Page }) {
  return (
    <>
      <PageHero
        title="Εφαρμογές ξηρού πάγου & CO₂"
        lead="Μεταφορές, εστίαση, καθαρισμοί, θέαμα, οινοποιία, φαρμακοβιομηχανία και βιομηχανία τροφίμων. Διάλεξε τον κλάδο σου."
        crumbs={[{ label: "Εφαρμογές", href: page.path }]}
      />
      <Wrap className="py-16 sm:py-20">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((a) => (
            <li key={a.href}>
              <Link href={a.href} className="group relative block aspect-[4/3] overflow-hidden rounded-[24px] border frost-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(a.image)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-ice group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/40 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-6">
                  <span className="heading block text-2xl text-frost">{a.title}</span>
                  <span className="mt-1 block text-glacier-2">{a.short}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Wrap>
      <ContactBand />
    </>
  );
}

function AboutTemplate({ page }: { page: Page }) {
  const cut = page.html.indexOf("ΚΑΙ ΓΙΑΤΙ");
  const intro = cut > 0 ? page.html.slice(0, page.html.lastIndexOf("<", cut)) : page.html;
  return (
    <>
      <PageHero
        title="Ποιοι είμαστε"
        lead="Η Dry Ice Creation ιδρύθηκε το 2013 για να καλύψει τις ανάγκες της αγοράς ξηρού πάγου στην Ελλάδα."
        crumbs={crumbsFor(page)}
        image="/media/2017/10/Dry-Ice-Scoop.jpg"
      />
      <Wrap className="grid gap-14 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Prose html={intro} />
          <dl className="mt-14 grid gap-x-10 gap-y-10 border-t frost-line pt-12 sm:grid-cols-2">
            {reasons.map((r) => (
              <div key={r.title}>
                <dt className="heading text-xl text-frost">{r.title}</dt>
                <dd className="mt-2 leading-relaxed text-glacier">{r.text}</dd>
              </div>
            ))}
          </dl>
          <Link href="/i-poria-mas/" className="mt-12 inline-flex items-center gap-2 text-ember-2 hover:text-ember">
            Η πορεία μας από το 2013 <Icon name="arrow" size={16} />
          </Link>
        </div>
        <Sidebar current={page.path} section={sectionOf(page.path)} />
      </Wrap>
      <ContactBand />
    </>
  );
}

function NewsTemplate({ path }: { path: string }) {
  const cfg = NEWS[path];
  const list = cfg.category ? posts.filter((p) => p.categories.includes(cfg.category!)) : posts;
  const [first, ...rest] = list;
  const tabs = Object.entries(NEWS);
  return (
    <>
      <PageHero title={cfg.title} lead="Άρθρα, ανακοινώσεις και στιγμές από τη δουλειά μας." crumbs={[{ label: cfg.title, href: path }]} />
      <Wrap className="py-16 sm:py-20">
        <nav aria-label="Κατηγορίες" className="mb-12 flex flex-wrap gap-2">
          {tabs.map(([href, t]) => (
            <Link
              key={href}
              href={href}
              aria-current={href === path ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                href === path ? "border-ember bg-ember text-abyss" : "frost-line text-glacier-2 hover:border-glacier/60 hover:text-frost"
              }`}
            >
              {t.title === "Νέα" ? "Όλα" : t.title}
            </Link>
          ))}
        </nav>
        {first && (
          <div className="mb-16">
            <PostCard post={first} large />
          </div>
        )}
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <PostCard key={p.path} post={p} />
          ))}
        </div>
      </Wrap>
    </>
  );
}

function PostTemplate({ page }: { page: Page }) {
  const img = postImage(page);
  const hasVideo = page.html.includes("<iframe");
  const related = posts.filter((p) => p.path !== page.path).slice(0, 3);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: cleanTitle(page.title),
    datePublished: page.date,
    dateModified: page.modified,
    author: { "@type": "Organization", name: business.name },
    publisher: { "@id": "https://dryicecreation.gr/#business" },
    ...(img ? { image: "https://dryicecreation.gr" + img } : {}),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero
        title={cleanTitle(page.title)}
        crumbs={[{ label: "Νέα", href: "/nea/" }, { label: cleanTitle(page.title), href: page.path }]}
        meta={
          <p className="flex flex-wrap items-center gap-3 text-sm">
            <time dateTime={page.date || undefined}>{formatDate(page.date)}</time>
            {page.categories.map((c) => (
              <span key={c} className="rounded-full border frost-line px-2.5 py-0.5 text-xs">
                {c}
              </span>
            ))}
          </p>
        }
      />
      <Wrap className="py-16 sm:py-20">
        <article className="mx-auto max-w-[760px]">
          {img && !hasVideo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(img)} alt="" className="mb-12 w-full rounded-[24px] border frost-line object-cover" />
          )}
          <Prose html={stripImage(page.html, img)} className="max-w-none" />
        </article>
      </Wrap>
      <section className="border-t frost-line py-16 sm:py-20">
        <Wrap>
          <h2 className="display mb-10 text-[2rem] text-frost">Διάβασε επίσης</h2>
          <div className="grid gap-10 md:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.path} post={p} />
            ))}
          </div>
        </Wrap>
      </section>
    </>
  );
}

function Redirect({ to }: { to: string }) {
  const href = (process.env.NEXT_PUBLIC_BASE_PATH || "") + to;
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${href}`} />
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(href)})` }} />
      <Wrap className="py-40 text-center">
        <p className="text-glacier-2">
          Η σελίδα μεταφέρθηκε.{" "}
          <Link href={to} className="text-ember-2 underline underline-offset-4">
            Συνέχεια εδώ
          </Link>
        </p>
      </Wrap>
    </>
  );
}
