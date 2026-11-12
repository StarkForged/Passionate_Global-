/** About — reference: ref2 (concentric arcs with activity chips + central stats). */
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Check, FileText, CalendarCheck, PhoneCall, Wallet, Heart, MessageSquare, ShieldCheck } from 'lucide-react';
import { about } from '@/data/content';
import { Counter, EASE, Reveal, SplitHeading, Tag } from '@/components/ui';

type ChipDef = { arc: 0 | 1; a: number; kind: 'pill' | 'avatar' | 'icon' | 'badge'; label?: string; icon?: any; tone?: string; initials?: string; bg?: string };

const CHIPS: ChipDef[] = [
  { arc: 0, a: 166, kind: 'pill', label: 'Compliance cleared', icon: ShieldCheck, tone: 'ok' },
  { arc: 0, a: 138, kind: 'avatar', initials: 'SR', bg: 'linear-gradient(135deg,#7DB8FF,#1679E0)' },
  { arc: 0, a: 116, kind: 'pill', label: 'CV formatted', icon: FileText },
  { arc: 0, a: 90, kind: 'pill', label: '12 shifts booked', icon: CalendarCheck },
  { arc: 0, a: 64, kind: 'pill', label: 'References chased', icon: PhoneCall },
  { arc: 0, a: 42, kind: 'avatar', initials: 'MK', bg: 'linear-gradient(135deg,#0361DB,#01152D)' },
  { arc: 0, a: 15, kind: 'pill', label: 'Payroll processed', icon: Wallet, tone: 'ok' },
  { arc: 1, a: 157, kind: 'badge', label: '24', icon: Heart },
  { arc: 1, a: 124, kind: 'avatar', initials: 'AP', bg: 'linear-gradient(135deg,#1679E0,#0245A8)' },
  { arc: 1, a: 90, kind: 'icon', icon: Check, tone: 'ok' },
  { arc: 1, a: 57, kind: 'icon', icon: FileText },
  { arc: 1, a: 24, kind: 'badge', label: '8', icon: MessageSquare },
];

const RADII = [0.47, 0.335]; // fraction of stage width
const ASPECT = 2.15; // width / height

function ArcStage() {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0, vis = false;
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) raf = requestAnimationFrame(loop); });
    const loop = (time: number) => { setT(time); if (vis) raf = requestAnimationFrame(loop); };
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref} className="relative mx-auto hidden w-full max-w-[1120px] md:block" style={{ aspectRatio: `${ASPECT}` }}>
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 1000 ${1000 / ASPECT}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="arcfade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0361DB" stopOpacity=".28" /><stop offset="1" stopColor="#0361DB" stopOpacity="0" /></linearGradient>
        </defs>
        {RADII.map((r, i) => (
          <motion.path key={i} d={`M ${500 - r * 1000} ${1000 / ASPECT} A ${r * 1000} ${r * 1000} 0 0 1 ${500 + r * 1000} ${1000 / ASPECT}`}
            fill="none" stroke="url(#arcfade)" strokeWidth="1.4" vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE, delay: i * 0.2 }} />
        ))}
        <circle cx="500" cy={1000 / ASPECT} r="250" fill="url(#arcfade)" opacity=".25" />
      </svg>

      {CHIPS.map((c, i) => {
        const wobble = Math.sin(t * 0.0004 + i * 1.7) * 3.2;
        const ang = ((c.a + wobble) * Math.PI) / 180;
        const r = RADII[c.arc];
        const x = 50 + r * 100 * Math.cos(ang);
        const y = 100 - r * 100 * ASPECT * Math.sin(ang);
        const Icon = c.icon;
        return (
          <motion.div key={i} className="absolute left-0 top-0" style={{ left: `${x}%`, top: `${y}%`, translateX: '-50%', translateY: '-50%' }}
            initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE, delay: 0.4 + i * 0.06 }}>
            {c.kind === 'pill' && (
              <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium text-ink shadow-soft">
                <span className={`grid h-6 w-6 place-items-center rounded-full ${c.tone === 'ok' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand/10 text-brand'}`}><Icon className="h-3.5 w-3.5" /></span>
                {c.label}
              </div>
            )}
            {c.kind === 'avatar' && (
              <div className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-white text-[13px] font-bold text-white shadow-lift" style={{ background: c.bg }}>{c.initials}</div>
            )}
            {c.kind === 'icon' && (
              <div className={`grid h-11 w-11 place-items-center rounded-2xl border border-line bg-gradient-to-b from-white to-[#F2F6FB] shadow-soft ${c.tone === 'ok' ? 'text-emerald-600' : 'text-brand'}`}><Icon className="h-5 w-5" /></div>
            )}
            {c.kind === 'badge' && (
              <div className="flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[12px] font-semibold text-ink shadow-soft"><Icon className="h-3.5 w-3.5 text-brand" />{c.label}</div>
            )}
          </motion.div>
        );
      })}

      {/* centre stats */}
      <div className="absolute bottom-[4%] left-1/2 grid w-[52%] -translate-x-1/2 grid-cols-3 gap-6 text-center">
        {about.stats.map((s, i) => (
          <Reveal key={i} delay={0.2 + i * 0.1}>
            <p className="font-display text-[clamp(2.8rem,5vw,4.6rem)] font-semibold leading-none tracking-[-0.05em] text-navy">
              <Counter to={s.value} />{s.suffix}
            </p>
            <p className="mx-auto mt-3 max-w-[16ch] text-[13.5px] leading-snug text-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" data-theme="light" className="section overflow-hidden bg-gradient-to-b from-white via-white to-ice">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] dot-grid [mask-image:radial-gradient(60%_80%_at_50%_0%,#000,transparent)]" />
      <div className="container-site relative">
        <ArcStage />

        {/* mobile stats */}
        <div className="grid grid-cols-3 gap-3 md:hidden">
          {about.stats.map((s, i) => (
            <div key={i} className="rounded-2xl border border-line bg-white p-4 text-center shadow-soft">
              <p className="font-display text-4xl font-semibold tracking-[-0.04em] text-navy"><Counter to={s.value} />{s.suffix}</p>
              <p className="mt-2 text-[11.5px] leading-snug text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-6 text-center md:mt-10">
          <Reveal y={12}><Tag>{about.eyebrow}</Tag></Reveal>
          <SplitHeading text={about.title} className="h-section max-w-[16ch] text-ink" highlight={['differently']} />
        </div>

        <div className="mx-auto mt-14 grid max-w-[1000px] gap-8 md:grid-cols-2 md:gap-14">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="text-[17px] leading-[1.75] text-muted"><span className="mr-3 inline-block h-px w-8 translate-y-[-5px] bg-brand align-middle" />{p}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <p className="mx-auto max-w-[24ch] text-center font-display text-[clamp(1.8rem,3.6vw,3rem)] font-medium leading-[1.12] tracking-[-0.035em] text-navy">
            {about.punch[0]} <span className="text-grad">{about.punch[1]}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
