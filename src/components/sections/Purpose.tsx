/** Mission / Vision / Core values — reference: ref7 / ref8 ("Vision" hexagon slide + hexagon team row). */
import { motion } from 'framer-motion';
import { Target, Eye, Handshake, ShieldCheck, Crosshair, Award, Sparkles, RefreshCw } from 'lucide-react';
import { mission, vision, values } from '@/data/content';
import { EASE, Reveal, Spotlight, Tag } from '@/components/ui';

const HEX = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)';
const valueIcons = [Handshake, ShieldCheck, Crosshair, Award, Sparkles, RefreshCw];

function Hexagon({ dark, icon: Icon, label }: { dark?: boolean; icon: any; label: string }) {
  return (
    <div className="relative h-[164px] w-[146px] shrink-0">
      {/* soft shadow layer */}
      <div className="absolute inset-0 translate-y-3 blur-xl" style={{ clipPath: HEX, background: dark ? 'rgba(90,165,255,.45)' : 'rgba(3,97,219,.35)' }} />
      <motion.div
        className="relative grid h-full w-full place-items-center"
        style={{ clipPath: HEX, background: dark ? 'linear-gradient(160deg,#FFFFFF 0%,#D6E8FF 60%,#9CC8FF 100%)' : 'linear-gradient(160deg,#5AA5FF 0%,#0361DB 55%,#01152D 120%)' }}
        whileHover={{ rotate: -6, scale: 1.04 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}
      >
        <div className="absolute inset-[3px]" style={{ clipPath: HEX, background: dark ? 'linear-gradient(160deg,#fff,#E6F1FF)' : 'linear-gradient(160deg,#3D8FF5 0%,#0361DB 60%,#023E96 100%)' }} />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.55)_0%,transparent_38%)]" style={{ clipPath: HEX }} />
        <div className={`relative flex flex-col items-center gap-2 ${dark ? 'text-navy' : 'text-white'}`}>
          <Icon className="h-8 w-8" strokeWidth={1.6} />
          <span className="font-display text-[17px] font-semibold tracking-[-0.01em]">{label}</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function Purpose() {
  return (
    <section id="purpose" data-theme="light" className="relative overflow-hidden bg-ice pb-28 md:pb-36">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <Spotlight className="h-full rounded-[2rem] border border-white bg-white shadow-lift" color="rgba(3,97,219,.08)">
              <div className="flex h-full flex-col gap-8 p-8 sm:flex-row sm:items-center sm:p-11">
                <Hexagon icon={Target} label="Mission" />
                <div>
                  <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">Our Mission</p>
                  <p className="font-display text-[clamp(1.35rem,2vw,1.75rem)] font-medium leading-[1.3] tracking-[-0.025em] text-ink">{mission}</p>
                </div>
              </div>
              {/* decorative rings */}
              <svg className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 text-brand/[0.07]" viewBox="0 0 200 200" aria-hidden><circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" /><circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" /><circle cx="100" cy="100" r="42" fill="none" stroke="currentColor" /></svg>
            </Spotlight>
          </Reveal>
          <Reveal delay={0.1}>
            <Spotlight className="h-full rounded-[2rem] bg-[radial-gradient(120%_140%_at_0%_0%,#0B57C9_0%,#01152D_58%,#000915_100%)] text-white shadow-lift" color="rgba(90,165,255,.18)">
              <div className="flex h-full flex-col gap-8 p-8 sm:flex-row sm:items-center sm:p-11">
                <Hexagon dark icon={Eye} label="Vision" />
                <div>
                  <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-sky">Our Vision</p>
                  <p className="font-display text-[clamp(1.35rem,2vw,1.75rem)] font-medium leading-[1.3] tracking-[-0.025em]">{vision}</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 dot-grid-dark [mask-image:radial-gradient(60%_60%_at_100%_100%,#000,transparent)]" />
            </Spotlight>
          </Reveal>
        </div>

        {/* Core values */}
        <div className="mt-24 flex flex-col items-center">
          <Reveal y={12}><Tag>Core Values</Tag></Reveal>
          <div className="relative mt-14 w-full">
            {/* connecting line with travelling light */}
            <div className="absolute left-[8%] right-[8%] top-[44px] hidden h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent lg:block">
              <motion.div className="absolute top-1/2 h-[3px] w-24 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-sky to-transparent" animate={{ left: ['-10%', '100%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
            </div>
            <ul className="grid grid-cols-2 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
              {values.map((v, i) => {
                const Icon = valueIcons[i];
                return (
                  <motion.li key={v} className="group flex flex-col items-center text-center"
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}>
                    <div className="relative h-[88px] w-[78px] transition-transform duration-500 group-hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-b from-brand/30 to-brand/5 transition-all duration-500 group-hover:from-sky group-hover:to-brand" style={{ clipPath: HEX }} />
                      <div className="absolute inset-[1.5px] grid place-items-center bg-gradient-to-b from-white to-[#EEF4FB] text-brand transition-all duration-500 group-hover:from-[#2F86F0] group-hover:to-brand group-hover:text-white" style={{ clipPath: HEX }}>
                        <Icon className="h-7 w-7" strokeWidth={1.6} />
                      </div>
                    </div>
                    <p className="mt-5 max-w-[14ch] font-display text-[17px] font-semibold leading-tight tracking-[-0.015em] text-ink">{v}</p>
                    <span className="mt-3 h-[2px] w-7 rounded-full bg-brand/25 transition-all duration-500 group-hover:w-12 group-hover:bg-brand" />
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
