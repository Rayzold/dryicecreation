import { business } from "@/lib/site";
import { Icon } from "@/components/Icon";

/** Η μπάρα του παλιού site κάτω από το hero: ώρες, τηλέφωνο, παραγγελία. */
export function QuickBar() {
  const phone = business.phones[0];
  return (
    <section className="border-y frost-line bg-abyss-2">
      <div className="mx-auto grid max-w-[1320px] gap-px px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4 py-6 sm:pr-6">
          <Icon name="clock" size={26} className="mt-0.5 shrink-0 text-ember-2" />
          <div>
            <p className="heading text-lg text-frost">Ώρες λειτουργίας</p>
            {business.hours.map((h) => (
              <p key={h.days} className="text-[0.95rem] text-glacier">
                {h.days}: <span className="num">{h.time}</span>
              </p>
            ))}
          </div>
        </div>
        <a href={`tel:${phone.tel}`} className="group flex items-start gap-4 py-6 sm:px-6">
          <Icon name="phone" size={26} className="mt-0.5 shrink-0 text-ember-2" />
          <div>
            <p className="heading text-lg text-frost group-hover:text-ember-2">Πάρε μας τηλέφωνο</p>
            <p className="num text-[1.05rem] text-glacier-2">{phone.display}</p>
          </div>
        </a>
        <a href="#epikoinonia" className="group flex items-start gap-4 py-6 sm:pl-6">
          <Icon name="arrow" size={26} className="mt-0.5 shrink-0 text-ember-2" />
          <div>
            <p className="heading text-lg text-frost group-hover:text-ember-2">Βάλε παραγγελία</p>
            <p className="text-[0.95rem] text-glacier">Φόρμα ή η Χιόνη, κάτω δεξιά</p>
          </div>
        </a>
      </div>
    </section>
  );
}
