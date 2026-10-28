import Link from "next/link";
import { HeroFog } from "@/components/home/HeroFog";
import { HeroTitle } from "@/components/home/HeroTitle";
import { ServiceIndex } from "@/components/home/ServiceIndex";
import { Stats } from "@/components/home/Stats";
import { Section, SectionHead } from "@/components/Section";
import { ContactBand } from "@/components/ContactBand";
import { PostCard } from "@/components/PostCard";
import { Icon } from "@/components/Icon";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { applications, business, products, reasons, services } from "@/lib/site";
import { posts } from "@/lib/content";
import { asset } from "@/lib/asset";

export default function Home() {
  const [featured, ...rest] = products;
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden pb-14 pt-32 sm:pb-20">
        <HeroFog />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-abyss to-transparent" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <HeroTitle text="Ξηρός πάγος, CO₂ και υγρό άζωτο. Κάθε μέρα, σε όλη την Ελλάδα." />
              <p className="mt-7 max-w-[56ch] text-[1.1rem] leading-relaxed text-glacier-2 sm:text-[1.2rem]">
                Παράγουμε και διανέμουμε ξηρό πάγο σε pellets και blocks, μεταφέρουμε ευαίσθητα προϊόντα σε ψύξη και κατάψυξη, καθαρίζουμε με
                παγοβολή και γεμίζουμε σκηνές με χαμηλή ομίχλη.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={`tel:${business.phones[0].tel}`}
                  className="inline-flex items-center gap-2.5 rounded-full bg-ember px-6 py-4 font-medium text-abyss transition hover:bg-ember-2"
                >
                  <Icon name="phone" size={19} strokeWidth={2} />
                  Κάλεσε <span className="num">{business.phones[0].display}</span>
                </a>
                <a
                  href="#epikoinonia"
                  className="inline-flex items-center gap-2 rounded-full border border-frost/25 bg-abyss/30 px-6 py-4 text-frost backdrop-blur-sm transition hover:border-frost/60"
                >
                  Ζήτα προσφορά
                </a>
              </div>
            </div>
            <p className="hidden text-right lg:block" aria-label="Η θερμοκρασία του ξηρού πάγου είναι μείον 78,5 βαθμοί Κελσίου">
              <span className="display num block text-[4.2rem] font-[250] text-glacier-2/90" style={{ fontVariationSettings: '"SHRP" 100' }}>
                −78,5°C
              </span>
              <span className="mt-1 block text-sm text-glacier">η θερμοκρασία του ξηρού πάγου</span>
            </p>
          </div>
          <p className="mt-12 text-sm text-glacier lg:mt-16">
            <span className="relative mr-2 inline-flex size-2 align-middle">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-ember opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-ember" />
            </span>
            Αυθημερόν παράδοση σε όλη την Αττική.{" "}
            <span className="hidden text-glacier/70 lg:[@media(pointer:fine)]:inline">Κούνησε τον κέρσορα για να ανακατέψεις την ομίχλη.</span>
          </p>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────── */}
      <Section id="ypiresies">
        <SectionHead
          title="Τι κάνουμε"
          intro="Από ένα κουτί 10 κιλών για το εστιατόριο μέχρι εξαγωγές δειγμάτων σε άλλη ήπειρο: ο ξηρός πάγος φτάνει εκεί που πρέπει, στη θερμοκρασία που πρέπει."
        />
        <ServiceIndex items={services} />
      </Section>

      {/* ── Applications ─────────────────────────────────── */}
      <section className="border-y frost-line bg-abyss-2 py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <SectionHead
            title="Πού χρησιμοποιείται"
            intro="Είσαι επαγγελματίας; Δες πώς δουλεύει ο ξηρός πάγος και το CO₂ στον κλάδο σου."
            aside={
              <Link href="/efarmoges-xirou-pagou-dioxidiou/" className="inline-flex items-center gap-2 text-ember-2 hover:text-ember">
                Όλες οι εφαρμογές <Icon name="arrow" size={16} />
              </Link>
            }
          />
        </div>
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] sm:px-6 lg:px-[max(2rem,calc((100vw-1320px)/2+2rem))]">
          {applications.map((a) => (
            <li key={a.href} className="w-[78vw] shrink-0 snap-start sm:w-[340px]">
              <Link href={a.href} className="group relative block aspect-[3/4] overflow-hidden rounded-[24px] border frost-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(a.image)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-ice group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="heading text-2xl text-frost">{a.title}</h3>
                  <p className="mt-2 text-[0.95rem] text-glacier-2">{a.short}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Products ─────────────────────────────────────── */}
      <Section id="proionta">
        <SectionHead title="Προϊόντα" intro="Ό,τι χρειάζεσαι για να παράγεις, να μεταφέρεις και να χρησιμοποιήσεις ξηρό πάγο, άζωτο και CO₂." />
        <div className="grid gap-5 lg:grid-cols-3">
          <Link href={featured.href} className="group relative overflow-hidden rounded-[28px] border frost-line lg:col-span-2 lg:row-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(featured.image)} alt="Κοκτέιλ με ομίχλη από ξηρό πάγο" loading="lazy" className="aspect-[16/11] size-full object-cover transition-transform duration-700 ease-out-ice group-hover:scale-[1.03] lg:aspect-auto lg:absolute lg:inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
              <p className="text-sm text-ember-2">Για bars, clubs, εστιατόρια και δεξιώσεις</p>
              <h3 className="display mt-2 text-[2.4rem] text-frost sm:text-[3.2rem]">{featured.title}</h3>
              <p className="mt-3 max-w-[44ch] text-glacier-2">{featured.short}</p>
            </div>
          </Link>
          {rest.slice(0, 2).map((p) => (
            <ProductCard key={p.href} p={p} />
          ))}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(2).map((p) => (
            <ProductCard key={p.href} p={p} />
          ))}
        </div>
      </Section>

      {/* ── Why us ───────────────────────────────────────── */}
      <section className="border-t frost-line py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="display text-[2.2rem] text-frost sm:text-[3.1rem]">Γιατί ξηρός πάγος από εμάς</h2>
              <p className="mt-5 max-w-[42ch] text-[1.08rem] leading-relaxed text-glacier-2">
                Από το 2013 είμαστε συνεχώς στον δρόμο, για να φτάνει ξηρός πάγος αρίστης ποιότητας στην πόρτα σου.
              </p>
              <Link href="/about-dry-ice-creation/" className="mt-8 inline-flex items-center gap-2 text-ember-2 hover:text-ember">
                Γνώρισε την εταιρεία <Icon name="arrow" size={16} />
              </Link>
            </div>
            <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {reasons.map((r) => (
                <div key={r.title}>
                  <dt className="heading text-xl text-frost">{r.title}</dt>
                  <dd className="mt-2 leading-relaxed text-glacier">{r.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-20">
            <Stats items={business.stats} />
          </div>
        </div>
      </section>

      {/* ── News ─────────────────────────────────────────── */}
      <Section className="border-t frost-line">
        <SectionHead
          title="Νέα"
          aside={
            <Link href="/nea/" className="inline-flex items-center gap-2 text-ember-2 hover:text-ember">
              Όλα τα νέα <Icon name="arrow" size={16} />
            </Link>
          }
        />
        <div className="grid gap-10 md:grid-cols-3">
          {posts.slice(0, 3).map((p) => (
            <PostCard key={p.path} post={p} />
          ))}
        </div>
      </Section>

      <ContactBand />
    </>
  );
}

function ProductCard({ p }: { p: (typeof products)[number] }) {
  return (
    <SpotlightCard spotlightColor="rgba(143, 184, 201, 0.35)" intensity={0.25} borderGlow={0.7} className="group relative overflow-hidden rounded-[24px] border frost-line bg-abyss-2 p-0!">
      <Link href={p.href} className="flex h-full flex-col">
        <div className="aspect-[16/10] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(p.image)} alt="" loading="lazy" className="size-full object-cover opacity-90 transition duration-700 ease-out-ice group-hover:scale-[1.04] group-hover:opacity-100" />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="heading text-xl text-frost">{p.title}</h3>
          <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-glacier">{p.short}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-ember-2">
            Δες περισσότερα <Icon name="arrow" size={15} />
          </span>
        </div>
      </Link>
    </SpotlightCard>
  );
}
