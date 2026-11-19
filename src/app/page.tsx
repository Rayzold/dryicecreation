import Link from "next/link";
import { HeroSlides } from "@/components/home/HeroSlides";
import { QuickBar } from "@/components/home/QuickBar";
import { ServiceCards } from "@/components/home/ServiceCards";
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
  return (
    <>
      {/* ── Hero: οι υπηρεσίες σε εναλλασσόμενες κάρτες, όπως στο παλιό site ── */}
      <HeroSlides
        slides={[
          { title: "Ξηρός πάγος & CO₂", line: "Διανομή ξηρού πάγου πανελλαδικά, σε όλες τις μορφές και για όλες τις χρήσεις.", href: "/dianomi-xirou-pagou/", image: "/media/2017/10/Dry-Ice-Scoop.jpg" },
          { title: "Ανασυσκευασία, μεταφορές, εξαγωγές", line: "Για ευαίσθητα προϊόντα που ταξιδεύουν σε ψύξη ή κατάψυξη.", href: "/anasyskeyasia-metafores-dry-ice-courier/", image: "/media/2017/09/Dry-Ice-Bucket.jpg" },
          { title: "Αποστολές σε όλο τον κόσμο", line: "Από την πόρτα σου μέχρι την πόρτα του παραλήπτη.", href: "/dry-ice-courier-apostoles-paradoseis-exoterikoy/", image: "/media/2017/09/Dry-Ice-For-Food.jpg" },
          { title: "Εφέ καπνού & χαμηλής ομίχλης", line: "Για γάμους, θέατρα, τηλεόραση, βιντεοκλίπ και παρουσιάσεις.", href: "/paragogi-efe-kapnou-omichlis-comfetti/", image: "/media/2017/11/Dry-ice-fog-effect-in-a-wedding-4.jpg" },
          { title: "Καθαρισμός με παγοβολή", line: "Χωρίς νερό και χημικά, για επιφάνειες, αυτοκίνητα και βιομηχανικό εξοπλισμό.", href: "/katharismos-apolymansi-me-pagovoli/", image: "/media/2017/11/Dry-ice-blasting-for-industrial-cleaning.jpg" },
        ]}
      />
      <QuickBar />

      {/* ── Services ─────────────────────────────────────── */}
      <Section id="ypiresies">
        <SectionHead title="Τι σου προσφέρουμε" />
        <ServiceCards items={services} />
      </Section>

      {/* ── Applications ─────────────────────────────────── */}
      <section className="border-y frost-line bg-abyss-2 py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <SectionHead
            title="Πού χρησιμοποιείται"
            intro="Είσαι επαγγελματίας; Διάλεξε τον κλάδο σου."
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
        <SectionHead title="Τα προϊόντα μας" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
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
