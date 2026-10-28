import { business } from "@/lib/site";
import { ContactForm } from "./ContactForm";
import { Icon } from "./Icon";

export function ContactBand({ title = "Πες μας τι χρειάζεσαι", id = "epikoinonia" }: { title?: string; id?: string }) {
  return (
    <section id={id} className="relative scroll-mt-24 overflow-hidden border-t frost-line">
      <div className="fog-static absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1320px] gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <h2 className="display text-[2.2rem] text-frost sm:text-[3.1rem]">{title}</h2>
          <p className="mt-5 max-w-[46ch] text-[1.08rem] leading-relaxed text-glacier-2">
            Για παραγγελίες ζητάμε 24 έως 48 ώρες ειδοποίηση, ώστε να εξασφαλίσουμε ποσότητα και έγκαιρη παράδοση. Για κάτι επείγον, πάρε τηλέφωνο.
          </p>

          <ul className="mt-10 grid gap-3">
            {business.phones.map((p, i) => (
              <li key={p.tel}>
                <a
                  href={`tel:${p.tel}`}
                  className={`group flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition ${
                    i === 0 ? "border-ember/60 bg-ember/10 hover:bg-ember/20" : "frost-line hover:border-glacier/50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon name="phone" size={19} className={i === 0 ? "text-ember" : "text-glacier"} />
                    <span className="num heading text-xl text-frost">{p.display}</span>
                  </span>
                  <span className="text-sm text-glacier">{p.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <dl className="mt-10 grid gap-6 text-[0.95rem] sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-2 text-glacier">
                <Icon name="clock" size={16} /> Ωράριο
              </dt>
              {business.hours.map((h) => (
                <dd key={h.days} className="mt-2 text-glacier-2">
                  {h.days}
                  <br />
                  <span className="num text-frost">{h.time}</span>
                </dd>
              ))}
            </div>
            <div>
              <dt className="flex items-center gap-2 text-glacier">
                <Icon name="pin" size={16} /> Έδρα
              </dt>
              <dd className="mt-2 text-glacier-2">
                {business.address.street}
                <br />
                {business.address.area}, <span className="num">{business.address.postalCode}</span>
              </dd>
              <dd className="mt-2">
                <a href={business.mapsUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-ember-2 hover:text-ember">
                  <Icon name="directions" size={15} /> Οδηγίες στον χάρτη
                </a>
              </dd>
            </div>
          </dl>

          <a
            href={business.app}
            target="_blank"
            rel="noopener"
            className="mt-10 inline-flex items-center gap-3 rounded-full border frost-line px-5 py-3 text-sm text-glacier-2 transition hover:border-glacier/60 hover:text-frost"
          >
            <Icon name="external" size={16} />
            Παραγγελίες και από την εφαρμογή μας για Android
          </a>
        </div>

        <div className="rounded-[28px] border frost-line bg-abyss-2/80 p-6 backdrop-blur-md sm:p-10">
          <p className="heading text-2xl text-frost">Στείλε μας μήνυμα</p>
          <p className="mb-8 mt-2 text-glacier">
            Ή γράψε απευθείας στο{" "}
            <a href={`mailto:${business.email}`} className="text-glacier-2 underline underline-offset-4 hover:text-frost">
              {business.email}
            </a>
          </p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
