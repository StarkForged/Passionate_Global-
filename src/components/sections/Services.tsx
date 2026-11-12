/**
 * Services — "stacking cards". Four full-width cards pin and stack on scroll (each scales to ~0.94
 * and dims as the next slides over it). One calm illustration per service; no invented data
 * (skeleton bars instead of names / amounts).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Check, UserRound, Inbox, CircleCheck } from 'lucide-react';
import { services } from '@/data/content';
import { EASE, Reveal, SectionHeader } from '@/components/ui';
import { formatTime, hourIn, useNow } from '@/hooks/useClock';
import { usePinnable } from '@/hooks/useMedia';
import { prefersReducedMotion } from '@/lib/scroll';
import { cn } from '@/lib/utils';

type Theme = { card: string; panel: string; title: string; body: string; idx: string; check: string; item: string; dark: boolean };
const themes: Theme[] = [
  { card: 'bg-white border border-line', panel: 'bg-ice', title: 'text-ink', body: 'text-muted', idx: 'text-brand', check: 'bg-brand/10 text-brand', item: 'text-ink', dark: false },
  { card: 'bg-ice border border-white', panel: 'bg-white', title: 'text-ink', body: 'text-muted', idx: 'text-brand', check: 'bg-brand/10 text-brand', item: 'text-ink', dark: false },
  { card: 'bg-navy', panel: 'bg-white/[0.04] border border-white/10', title: 'text-white', body: 'text-[#B9CBE4]', idx: 'text-sky', check: 'bg-sky/15 text-sky', item: 'text-white', dark: true },
  // deeper than bg-grad so white body copy stays AA
  { card: 'bg-[linear-gradient(135deg,#0361DB_0%,#0245A8_55%,#01306F_100%)]', panel: 'bg-white/[0.08] border border-white/15', title: 'text-white', body: 'text-white/90', idx: 'text-[#BFDCFF]', check: 'bg-white/15 text-white', item: 'text-white', dark: true },
];

const usePlay = <T extends Element,>() => {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });
  return [ref, inView || prefersReducedMotion()] as const;
};

/* ---------- 1. Recruitment: candidates travel one curved path, Sourced → Placed ---------- */
const PATH = 'M 50 290 C 190 290 220 90 470 80';
function RecruitmentArt() {
  const [ref, on] = usePlay<HTMLDivElement>();
  return (
    <div ref={ref} className="relative h-[360px] w-[520px]">
      <svg viewBox="0 0 520 360" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d={PATH} fill="none" stroke="rgba(3,97,219,.15)" strokeWidth="2" strokeDasharray="4 8" strokeLinecap="round" />
        <motion.path d={PATH} fill="none" stroke="url(#rg)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={on ? { pathLength: 1 } : undefined} transition={{ duration: 1.8, ease: EASE }} />
        <defs><linearGradient id="rg" x1="0" x2="1"><stop stopColor="#5AA5FF" /><stop offset="1" stopColor="#0361DB" /></linearGradient></defs>
        <circle cx="50" cy="290" r="7" fill="#fff" stroke="#5AA5FF" strokeWidth="3" />
        <circle cx="470" cy="80" r="9" fill="#0361DB" />
      </svg>
      <span className="absolute left-[24px] top-[312px] text-[14px] font-semibold text-muted">Sourced</span>
      <span className="absolute left-[400px] top-[28px] flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[14px] font-semibold text-white shadow-blue"><Check className="h-4 w-4" strokeWidth={2.5} />Placed</span>
      {on && [0, 1, 2, 3].map((i) => (
        <div key={i} className="travel absolute left-0 top-0 flex h-[50px] w-[150px] items-center gap-2.5 rounded-2xl bg-white px-3 shadow-lift"
          style={{ offsetPath: `path("${PATH}")`, offsetDistance: `${14 + i * 24}%`, animationDelay: `${-i * 2.6 + 1.6}s` }}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-grad text-white"><UserRound className="h-4 w-4" /></span>
          <span className="flex flex-1 flex-col gap-1.5"><span className="h-2 w-[80%] rounded-full bg-navy/15" /><span className="h-2 w-[50%] rounded-full bg-navy/[0.08]" /></span>
        </div>
      ))}
    </div>
  );
}

/* ---------- 2. Finance: ledger rows tick to "Matched", total reconciles ---------- */
function FinanceArt() {
  const [ref, on] = usePlay<HTMLDivElement>();
  const rows = [0.62, 0.48, 0.7, 0.55];
  return (
    <div ref={ref} className="w-[420px] rounded-[1.5rem] bg-white p-6 shadow-lift">
      <div className="flex items-center justify-between">
        <p className="font-display text-[18px] font-semibold tracking-[-0.02em] text-ink">Bank reconciliation</p>
        <span className="h-2.5 w-16 rounded-full bg-navy/[0.08]" />
      </div>
      <div className="mt-5 divide-y divide-navy/[0.07]">
        {rows.map((w, i) => (
          <div key={i} className="flex items-center gap-3 py-3.5">
            <span className="h-8 w-8 shrink-0 rounded-xl bg-ice" />
            <span className="flex flex-1 flex-col gap-1.5"><span className="h-2.5 rounded-full bg-navy/[0.12]" style={{ width: `${w * 100}%` }} /><span className="h-2 w-1/3 rounded-full bg-navy/[0.06]" /></span>
            <motion.span className="flex w-[92px] items-center justify-center gap-1 rounded-full py-1 text-[13px] font-semibold" initial={{ backgroundColor: 'rgba(1,21,45,.05)', color: '#5A6A80' }}
              animate={on ? { backgroundColor: 'rgba(3,97,219,.1)', color: '#0361DB' } : undefined} transition={{ duration: 0.4, delay: 0.6 + i * 0.7 }}>
              <AnimatePresence mode="wait" initial={false}>
                {on ? (
                  <motion.span key="m" className="flex items-center gap-1" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.7 }}><Check className="h-3.5 w-3.5" strokeWidth={3} />Matched</motion.span>
                ) : <span key="p">Pending</span>}
              </AnimatePresence>
            </motion.span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-ice p-4">
        <div className="flex items-center justify-between text-[14px] font-semibold"><span className="text-ink">Reconciled</span><motion.span className="tabular-nums text-brand" initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : undefined} transition={{ delay: 3.4 }}>100%</motion.span></div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white"><motion.div className="h-full rounded-full bg-grad" initial={{ width: '0%' }} animate={on ? { width: '100%' } : undefined} transition={{ duration: 2.8, ease: 'easeInOut', delay: 0.6 }} /></div>
      </div>
    </div>
  );
}

/* ---------- 3. Out-of-hours: 24h ring, 17:00–09:00 highlighted, live UK time ---------- */
function OohArt() {
  const now = useNow(1000);
  const [ref, on] = usePlay<HTMLDivElement>();
  const R = 128, C = 2 * Math.PI * R;
  const ang = (h: number) => (h / 24) * 360 - 90; // 00:00 at the top
  const pt = (h: number, r: number) => [160 + r * Math.cos((ang(h) * Math.PI) / 180), 160 + r * Math.sin((ang(h) * Math.PI) / 180)];
  const uk = hourIn('Europe/London', now);
  const [dx, dy] = pt(uk, R);
  const span = 16 / 24; // 17:00 → 09:00
  return (
    <div ref={ref} className="relative h-[340px] w-[340px]">
      <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="160" cy="160" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="18" />
        <motion.circle cx="160" cy="160" r={R} fill="none" stroke="url(#oog)" strokeWidth="18" strokeLinecap="round"
          transform={`rotate(${ang(17)} 160 160)`} strokeDasharray={`${C * span} ${C}`} initial={{ strokeDashoffset: C * span }} animate={on ? { strokeDashoffset: 0 } : undefined} transition={{ duration: 2, ease: EASE }} />
        <defs><linearGradient id="oog" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5AA5FF" /><stop offset="1" stopColor="#1679E0" /></linearGradient></defs>
        {[0, 6, 12, 18].map((h) => { const [x, y] = pt(h, R - 34); return <text key={h} x={x} y={y + 5} textAnchor="middle" fill="rgba(185,203,228,.8)" fontSize="13" fontWeight="600">{String(h).padStart(2, '0')}</text>; })}
        <circle cx={dx} cy={dy} r="9" fill="#fff" />
        <circle cx={dx} cy={dy} r="15" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-sky">UK time</span>
        <span className="mt-1 font-display text-[40px] font-semibold tabular-nums leading-none tracking-[-0.03em] text-white">{formatTime('Europe/London', now)}</span>
        <span className="mt-2 text-[13px] text-[#B9CBE4]">17:00 – 09:00 covered</span>
      </div>
    </div>
  );
}

/* ---------- 4. Business support: inbox clears to zero, calendar strip ---------- */
function BusinessArt() {
  const [ref, on] = usePlay<HTMLDivElement>();
  const [left, setLeft] = useState(4);
  useEffect(() => {
    if (!on) return;
    if (prefersReducedMotion()) { setLeft(0); return; }
    const id = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 900);
    return () => clearInterval(id);
  }, [on]);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <div ref={ref} className="w-[420px] space-y-4">
      <div className="rounded-[1.5rem] bg-white p-6 shadow-lift">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-display text-[18px] font-semibold tracking-[-0.02em] text-ink"><Inbox className="h-5 w-5 text-brand" strokeWidth={1.8} />Inbox</p>
          <motion.span key={left} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="grid h-7 min-w-7 place-items-center rounded-full bg-brand px-2 text-[13px] font-semibold tabular-nums text-white">{left}</motion.span>
        </div>
        <div className="relative mt-4 h-[200px]">
          <AnimatePresence>
            {Array.from({ length: left }).map((_, i) => (
              <motion.div key={i} layout exit={{ opacity: 0, x: 60 }} transition={{ duration: 0.5, ease: EASE }} className="flex items-center gap-3 border-b border-navy/[0.07] py-3.5 last:border-0">
                <span className="h-8 w-8 shrink-0 rounded-full bg-ice" />
                <span className="flex flex-1 flex-col gap-1.5"><span className="h-2.5 w-2/3 rounded-full bg-navy/[0.12]" /><span className="h-2 w-[85%] rounded-full bg-navy/[0.06]" /></span>
              </motion.div>
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {left === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE, delay: 0.3 }} className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <CircleCheck className="h-12 w-12 text-brand" strokeWidth={1.6} />
                <span className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">Inbox zero</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 rounded-[1.25rem] bg-white/10 p-2">
        {days.map((d, i) => (
          <div key={d} className={cn('flex flex-col items-center gap-2 rounded-xl py-3', i === 2 ? 'bg-white text-brand' : 'text-white')}>
            <span className="text-[13px] font-semibold">{d}</span>
            <span className="flex gap-1">{Array.from({ length: [2, 1, 3, 1, 2][i] }).map((_, k) => <span key={k} className={cn('h-1.5 w-1.5 rounded-full', i === 2 ? 'bg-brand' : 'bg-white/70')} />)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const arts: ReactNode[] = [<RecruitmentArt />, <FinanceArt />, <OohArt />, <BusinessArt />];
const artSize = [[520, 360], [420, 440], [340, 340], [420, 420]];

/** Scales a fixed-size illustration to fit its panel. The art is taken out of flow so its
 *  fixed width never widens the card; on small screens the panel height follows the scale. */
function Fit({ i }: { i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, h] = artSize[i];
  const [s, setS] = useState(1);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const lg = matchMedia('(min-width: 1024px)');
    const ro = new ResizeObserver(([e]) => setS(Math.min(1, (e.contentRect.width - 32) / w, lg.matches ? (e.contentRect.height - 32) / h : 1)));
    ro.observe(el); return () => ro.disconnect();
  }, [w, h]);
  return (
    <div ref={ref} className="relative h-full w-full min-w-0 overflow-hidden" style={{ minHeight: Math.round(h * s + 40) }}>
      <div className="absolute left-1/2 top-1/2" style={{ width: w, height: h, transform: `translate(-50%, -50%) scale(${s})` }}>{arts[i]}</div>
    </div>
  );
}

const STICK = 96, STEP = 24;
type Geo = { top: number; vh: number };

function Card({ i, scrollY, geo, stacked }: { i: number; scrollY: MotionValue<number>; geo: Geo; stacked: boolean }) {
  const s = services.items[i], t = themes[i], n = services.items.length;
  // Card i+1 slides over card i between: its top entering the viewport → it sticking.
  const coverFrom = geo.top + i * geo.vh;
  const coverTo = geo.top + (i + 1) * geo.vh - STICK - (i + 1) * STEP;
  const lastSticks = geo.top + (n - 1) * geo.vh - STICK - (n - 1) * STEP;
  const last = i === n - 1;
  // covered cards shrink (first card ends at 0.94) and dim as the next one slides over
  const scale = useTransform(scrollY, [coverFrom, Math.max(coverFrom + 1, lastSticks)], [1, last ? 1 : 1 - (n - 1 - i) * 0.02]);
  const dim = useTransform(scrollY, [coverFrom + (coverTo - coverFrom) * 0.4, coverTo], [0, last ? 0 : 0.3]);
  return (
    <motion.article style={stacked ? { scale, transformOrigin: 'top center' } : undefined}
      className={cn('relative grid overflow-hidden rounded-[2rem] shadow-lift lg:h-[580px] lg:grid-cols-[45fr_55fr]', t.card)}>
      <div className="flex flex-col p-8 sm:p-12 lg:order-1">
        <span className={cn('font-display text-[15px] font-semibold tabular-nums tracking-[0.04em]', t.idx)}>0{i + 1}</span>
        {'lead' in s && s.lead && <p className={cn('mt-6 font-display text-[19px] font-medium tracking-[-0.015em]', t.idx)}>{s.lead}</p>}
        <h3 className={cn('font-display text-[clamp(2rem,3.4vw,2.9rem)] font-semibold leading-[1.04] tracking-[-0.04em]', 'lead' in s && s.lead ? 'mt-3' : 'mt-6', t.title)}>{s.title}</h3>
        <p className={cn('mt-5 text-[17px] leading-[1.7]', t.body)}>{s.body}</p>
        <p className={cn('mt-auto pt-8 text-[13px] font-semibold uppercase tracking-[0.16em]', t.idx)}>Services include</p>
        <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {s.list.map((x) => (
            <li key={x} className={cn('flex items-start gap-2.5 text-[15.5px] font-medium leading-snug', t.item)}>
              <span className={cn('mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-full', t.check)}><Check className="h-3 w-3" strokeWidth={3} /></span>{x}
            </li>
          ))}
        </ul>
      </div>
      <div className={cn('order-first m-3 rounded-[1.5rem] lg:order-2 lg:ml-0', t.panel)}><Fit i={i} /></div>
      {stacked && <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-navy" />}
    </motion.article>
  );
}


function Stack() {
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [geo, setGeo] = useState<Geo>({ top: 0, vh: 900 });
  useEffect(() => {
    const measure = () => wrap.current && setGeo({ top: wrap.current.getBoundingClientRect().top + scrollY.get(), vh: innerHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [scrollY]);
  return (
    <div ref={wrap} className="relative mt-16">
      {services.items.map((s, i) => (
        <div key={s.id} className="sticky h-[100vh] last:h-auto" style={{ top: STICK + i * STEP }}>
          <Card i={i} scrollY={scrollY} geo={geo} stacked />
        </div>
      ))}
    </div>
  );
}

export default function Services() {
  const pin = usePinnable();
  const still = useMotionValue(0);
  const geo = { top: 0, vh: 1 };
  return (
    <section id="services" data-theme="light" className="section bg-white">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
          <SectionHeader align="left" tag={services.eyebrow} title={services.title} highlight={['Growth']} />
          <Reveal delay={0.1}><p className="text-[17px] leading-[1.75] text-muted">{services.intro}</p></Reveal>
        </div>
        {pin ? <Stack /> : (
          <div className="mt-14 grid gap-6">
            {services.items.map((s, i) => <Reveal key={s.id}><Card i={i} scrollY={still} geo={geo} stacked={false} /></Reveal>)}
          </div>
        )}
      </div>
    </section>
  );
}
