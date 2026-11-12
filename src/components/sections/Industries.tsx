/** Industries — reference: ref5 (top slide: frosted glass cards with concentric ring icons on a blue gradient panel). */
import { motion } from 'framer-motion';
import { HeartPulse, HandHeart, GraduationCap, Cpu, LineChart, Cog, Truck, Building2 } from 'lucide-react';
import { industries } from '@/data/content';
import { EASE, Reveal, SplitHeading, Tag, Tilt } from '@/components/ui';

const icons = [HeartPulse, HandHeart, GraduationCap, Cpu, LineChart, Cog, Truck, Building2];

function RingIcon({ icon: Icon }: { icon: any }) {
  return (
    <div className="relative grid h-[120px] w-[120px] place-items-center">
      {/* outer + inner arc rings (ref5) */}
      <svg className="absolute inset-0 h-full w-full transition-transform duration-[1400ms] ease-out group-hover:rotate-180" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(3,97,219,.16)" strokeWidth="5" strokeDasharray="70 106" strokeLinecap="round" transform="rotate(-125 60 60)" />
        <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(3,97,219,.16)" strokeWidth="5" strokeDasharray="70 106" strokeLinecap="round" transform="rotate(55 60 60)" />
      </svg>
      <svg className="absolute inset-[12px] transition-transform duration-[1400ms] ease-out group-hover:-rotate-180" viewBox="0 0 96 96" aria-hidden>
        <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(3,97,219,.22)" strokeWidth="3" strokeDasharray="40 98" strokeLinecap="round" transform="rotate(-20 48 48)" />
        <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(3,97,219,.22)" strokeWidth="3" strokeDasharray="40 98" strokeLinecap="round" transform="rotate(160 48 48)" />
      </svg>
      <span className="relative grid h-[62px] w-[62px] place-items-center rounded-full bg-[radial-gradient(circle_at_32%_28%,#8CC4FF_0%,#2F86F0_38%,#0361DB_70%,#0245A8_100%)] text-white shadow-[0_14px_30px_-8px_rgba(3,97,219,.65),inset_0_2px_6px_rgba(255,255,255,.5),inset_0_-4px_10px_rgba(1,21,45,.35)] transition-transform duration-500 group-hover:scale-110">
        <Icon className="h-[26px] w-[26px]" strokeWidth={1.7} />
      </span>
    </div>
  );
}

export default function Industries() {
  return (
    <section id="industries" data-theme="light" className="section bg-white">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#FFFFFF_0%,#EEF5FE_38%,#BFDCFF_78%,#8EC1FF_100%)] p-6 shadow-lift sm:p-10 lg:p-16">
          {/* soft light blobs */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-white/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[420px] w-[420px] rounded-full bg-[#5AA5FF]/30 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 dot-grid opacity-60 [mask-image:linear-gradient(90deg,#000,transparent_60%)]" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div className="flex flex-col items-start gap-6">
              <Reveal y={12}><Tag>{industries.eyebrow}</Tag></Reveal>
              <SplitHeading text={industries.title} className="h-section max-w-[15ch] text-ink" highlight={['Diverse']} />
            </div>
            <Reveal delay={0.1}>
              <p className="lead">{industries.intro}</p>
              <p className="mt-3 text-[15px] font-medium text-navy">{industries.sub}</p>
            </Reveal>
          </div>

          <div className="relative mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5" style={{ perspective: 1000 }}>
            {industries.items.map((name, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 30, rotateX: -12 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.9, ease: EASE, delay: (i % 4) * 0.08 + Math.floor(i / 4) * 0.12 }}>
                <Tilt className="group h-full">
                  <article className="glass-light flex h-full flex-col items-center rounded-[1.75rem] px-4 pb-7 pt-8 text-center shadow-[0_20px_40px_-24px_rgba(3,60,140,.45)] transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-24px_rgba(3,60,140,.55)]">
                    <RingIcon icon={icons[i]} />
                    <h3 className="mt-5 font-display text-[17px] font-semibold tracking-[-0.02em] text-ink sm:text-[19px]">{name}</h3>
                    <p className="mt-1.5 text-[12.5px] text-muted">Recruitment sector</p>
                  </article>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
