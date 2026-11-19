/**
 * Services — "stacking cards". Four full-width cards pin and stack on scroll (each scales to ~0.94
 * and dims as the next slides over it). One calm illustration per service; no invented data
 * (skeleton bars instead of names / amounts).
 */
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { AnimatePresence, motion, useAnimationFrame, useInView, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Check, UserRound, Inbox, CircleCheck } from 'lucide-react';
import { services } from '@/data/content';
import { isHydrating } from '@/lib/hydration';
import { Clock, EASE, Reveal, SectionHeader } from '@/components/ui';
import { formatTime, hourIn, useNow } from '@/hooks/useClock';
import { useMedia } from '@/hooks/useMedia';
import { navH, prefersReducedMotion } from '@/lib/scroll';
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

/* ---------- 1. Recruitment: candidates travel one curved path through five stages ----------
 * Geometry (520×380 canvas) was solved offline so no label is ever under a card: cards (120×44) are
 * centred on the path and visible between 8% and 92% of it; every label keeps ≥ 5px clearance.
 * Stage points sit on the path at length fractions 0 / .44 / .55 / .66 / 1. */
const PATH = 'M 90 310 C 321 310 255 60 420 60';
const RCYCLE = 10600, RTRAVEL = 6000, RGAP = 1600, RCARDS = 3;
const T0 = typeof performance !== 'undefined' ? performance.now() : 0; // shared clock: art + chips stay in sync
const STAGE_AT = [0.02, 0.44, 0.55, 0.66, 0.92]; // lead card progress that lights each stage
/** dot on the path, pill anchor + translate, connector end */
const STAGE_GEO = [
  { dot: [90, 310], pill: { left: 90, top: 336, x: '-50%', y: '0%' }, line: [90, 330] },
  { dot: [256, 226], pill: { left: 134, top: 226, x: '-100%', y: '-50%' }, line: [140, 226] },
  { dot: [280, 184], pill: { left: 381, top: 184, x: '0%', y: '-50%' }, line: [375, 184] },
  { dot: [303, 141], pill: { left: 410, top: 141, x: '0%', y: '-50%' }, line: [404, 141] },
  { dot: [420, 60], pill: { left: 489, top: 34, x: '-100%', y: '-100%' }, line: [420, 40] },
] as const;
const stages: readonly string[] = services.items[0].stages ?? [];
const cardProgress = (t: number, i: number) => Math.min(1, Math.max(0, (t - 300 - i * RGAP) / RTRAVEL));

/** Number of stages lit right now (all of them with reduced motion). */
function useStagesLit(active: boolean) {
  const still = prefersReducedMotion();
  const [lit, setLit] = useState(still ? stages.length : 0);
  useAnimationFrame(() => {
    if (!active || still) return;
    const p = cardProgress((performance.now() - T0) % RCYCLE, 0);
    const n = STAGE_AT.filter((a) => p >= a).length;
    setLit((v) => (v === n ? v : n));
  });
  return lit;
}

function StagePill({ label, on, className, style }: { label: string; on: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <span style={style} className={cn('flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[14px] font-semibold leading-5 transition-shadow duration-500',
      on ? 'border-transparent bg-grad text-white shadow-blue' : 'border-navy/10 bg-white text-muted shadow-soft', className)}>
      {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="mx-[3px] h-2 w-2 rounded-full bg-navy/15" />}
      {label}
    </span>
  );
}

/* Phones (< 768px, client round 3): the stage labels sit ON the illustration, as on desktop. The path is redrawn as a
 * vertical gentle S-curve with 5 nodes; each label is a compact pill beside its node, alternating right / left. One
 * candidate card travels node to node on the side opposite the current label, crossing the line at mid-gap (where the
 * curve crosses too), so it never covers a label: rows are G apart, the card is CH tall, pills 24px, which leaves
 * 4px clearance while the card slides across. Layout is computed from the measured pill widths and the box width
 * (no scaling, so text stays 12-13px), verified at 360 / 390 / 430. Reaching a node lights its label; labels stay lit
 * until the cycle resets. Reduced motion: card parked on the last node, all stages lit. */
const MG = 10, G = 70, CH = 38, PAD = 37, MOBILE_H = PAD * 2 + G * 4; // 354px box
const PILL_GAP = 14, CARD_GAP = 10; // from the node centre to the pill / card edge
const side = (k: number) => (k % 2 ? -1 : 1); // +1: label right of the line (card left), -1: the reverse
const M_IN = 400, M_DWELL = 700, M_DOWN = 320, M_SLIDE = 460, M_END = 1600, M_OUT = 400, M_BLANK = 400;
const M_SEG = M_DWELL + M_DOWN * 2 + M_SLIDE;
const M_CYCLE = M_IN + 4 * M_SEG + M_END + M_OUT + M_BLANK;
const ease = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
type MGeo = { W: number; cw: number; nodes: number[] };
const rowY = (k: number) => PAD + k * G;
const cardX = (g: MGeo, k: number) => g.nodes[k] - side(k) * (CARD_GAP + g.cw / 2);

/** Card centre, opacity and lit count at time t (ms) in the cycle. */
function mobileFrame(t: number, g: MGeo) {
  if (t < M_IN) return { x: cardX(g, 0), y: rowY(0), o: t / M_IN, lit: t >= M_IN / 2 ? 1 : 0 };
  t -= M_IN;
  if (t < 4 * M_SEG) {
    const k = Math.floor(t / M_SEG); let u = t - k * M_SEG;
    const y0 = rowY(k), mid = y0 + G / 2, a = cardX(g, k), b = cardX(g, k + 1);
    if (u < M_DWELL) return { x: a, y: y0, o: 1, lit: k + 1 };
    u -= M_DWELL;
    if (u < M_DOWN) return { x: a, y: y0 + (G / 2) * ease(u / M_DOWN), o: 1, lit: k + 1 };
    u -= M_DOWN;
    if (u < M_SLIDE) return { x: a + (b - a) * ease(u / M_SLIDE), y: mid, o: 1, lit: k + 1 };
    u -= M_SLIDE;
    return { x: b, y: mid + (G / 2) * ease(Math.min(1, u / M_DOWN)), o: 1, lit: k + 1 };
  }
  t -= 4 * M_SEG;
  if (t < M_END) return { x: cardX(g, 4), y: rowY(4), o: 1, lit: 5 };
  t -= M_END;
  if (t < M_OUT) return { x: cardX(g, 4), y: rowY(4), o: 1 - t / M_OUT, lit: 5 };
  return { x: cardX(g, 0), y: rowY(0), o: 0, lit: 0 };
}

function RecruitmentMobile() {
  const box = useRef<HTMLDivElement>(null);
  const pills = useRef<(HTMLSpanElement | null)[]>([]);
  const card = useRef<HTMLDivElement>(null);
  const still = prefersReducedMotion();
  const inView = useInView(box, { amount: 0.2 });
  const seen = useInView(box, { once: true, amount: 0.4 });
  const [geo, setGeo] = useState<MGeo | null>(null);
  const [lit, setLit] = useState(still ? stages.length : 0);

  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const measure = () => {
      const W = el.clientWidth, inner = W - 2 * MG;
      const widths = pills.current.map((p) => p?.offsetWidth ?? 110);
      const cw = Math.min(150, Math.floor(inner / 2 - CARD_GAP));
      const c = W / 2, amp = 16;
      // each node shifts towards its label (a gentle wave), clamped so pill and card both stay inside the box
      const nodes = widths.map((w, k) => {
        const s = side(k);
        const lo = s > 0 ? MG + cw + CARD_GAP : MG + w + PILL_GAP;
        const hi = s > 0 ? W - MG - w - PILL_GAP : W - MG - cw - CARD_GAP;
        return lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, c + s * amp));
      });
      setGeo((g) => (g && g.W === W && g.cw === cw && g.nodes.every((n, k) => n === nodes[k]) ? g : { W, cw, nodes }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el); pills.current.forEach((p) => p && ro.observe(p));
    return () => ro.disconnect();
  }, []);

  const place = (f: { x: number; y: number; o: number }, g: MGeo) => {
    const el = card.current; if (!el) return;
    el.style.transform = `translate(${f.x - g.cw / 2}px, ${f.y - CH / 2}px)`;
    el.style.opacity = String(f.o);
  };
  useLayoutEffect(() => { if (geo && still) place({ x: cardX(geo, 4), y: rowY(4), o: 1 }, geo); }, [geo, still]);
  useAnimationFrame(() => {
    if (!geo || still || !inView) return;
    const f = mobileFrame((performance.now() - T0) % M_CYCLE, geo);
    place(f, geo);
    setLit((v) => (v === f.lit ? v : f.lit));
  });

  const path = geo ? geo.nodes.map((x, k) => (k === 0 ? `M ${x} ${rowY(0)}` : `C ${geo.nodes[k - 1]} ${rowY(k - 1) + G / 2} ${x} ${rowY(k) - G / 2} ${x} ${rowY(k)}`)).join(' ') : '';
  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ height: MOBILE_H }}>
      {geo && (
        <svg width={geo.W} height={MOBILE_H} className="absolute inset-0" aria-hidden>
          <defs><linearGradient id="rgm" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#5AA5FF" /><stop offset="1" stopColor="#0361DB" /></linearGradient></defs>
          <path d={path} fill="none" stroke="rgba(3,97,219,.15)" strokeWidth="2" strokeDasharray="4 8" strokeLinecap="round" />
          <motion.path d={path} fill="none" stroke="url(#rgm)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: still ? 1 : 0 }} animate={seen ? { pathLength: 1 } : undefined} transition={{ duration: 1.6, ease: EASE }} />
          {geo.nodes.map((x, k) => <circle key={k} cx={x} cy={rowY(k)} r={k === 4 ? 7 : 5.5} fill={k < lit ? '#0361DB' : '#fff'} stroke={k < lit ? '#0361DB' : '#9CC8FF'} strokeWidth="2.5" style={{ transition: 'fill .4s, stroke .4s' }} />)}
        </svg>
      )}
      {stages.map((s, k) => {
        const x = geo?.nodes[k] ?? 0, right = side(k) > 0, on = k < lit;
        return (
          <span key={s} ref={(el) => { pills.current[k] = el; }}
            className={cn('absolute left-0 top-0 flex items-center gap-1 whitespace-nowrap rounded-full border px-[10px] py-1 text-[12px] font-semibold leading-4 transition-[background-color,color,box-shadow,border-color] duration-500 min-[380px]:text-[13px]',
              on ? 'border-transparent bg-grad text-white shadow-blue' : 'border-navy/10 bg-white text-muted shadow-soft')}
            style={{ visibility: geo ? 'visible' : 'hidden', transform: `translate(${right ? x + PILL_GAP : x - PILL_GAP}px, ${rowY(k)}px) translate(${right ? '0' : '-100%'}, -50%)` }}>
            <span className="grid w-3 shrink-0 place-items-center">{on ? <Check className="h-3 w-3" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-navy/20" />}</span>
            {s}
          </span>
        );
      })}
      {geo && (
        <div ref={card} aria-hidden className="absolute left-0 top-0 flex items-center gap-2 rounded-xl bg-white px-2.5 shadow-lift will-change-transform" style={{ width: geo.cw, height: CH, opacity: 0 }}>
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-grad text-white"><UserRound className="h-3 w-3" /></span>
          <span className="flex flex-1 flex-col gap-1.5"><span className="h-2 w-[80%] rounded-full bg-navy/15" /><span className="h-2 w-[50%] rounded-full bg-navy/[0.08]" /></span>
        </div>
      )}
    </div>
  );
}

function RecruitmentArt() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const inView = useInView(ref, { amount: 0.1 });
  const still = prefersReducedMotion();
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const lit = useStagesLit(inView);
  useAnimationFrame(() => {
    if (!inView || still) return;
    const t = (performance.now() - T0) % RCYCLE;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const p = 0.08 + cardProgress(t, i) * 0.84; // visible stretch of the path
      el.style.offsetDistance = `${p * 100}%`;
      el.style.opacity = String(Math.max(0, Math.min(1, (p - 0.08) / 0.05, (0.92 - p) / 0.05)));
    });
  });
  return (
    <div ref={ref} className="relative h-[380px] w-[520px]">
      <svg viewBox="0 0 520 380" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d={PATH} fill="none" stroke="rgba(3,97,219,.15)" strokeWidth="2" strokeDasharray="4 8" strokeLinecap="round" />
        <motion.path d={PATH} fill="none" stroke="url(#rg)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: still ? 1 : 0 }} animate={seen ? { pathLength: 1 } : undefined} transition={{ duration: 1.6, ease: EASE }} />
        <defs><linearGradient id="rg" x1="0" x2="1"><stop stopColor="#5AA5FF" /><stop offset="1" stopColor="#0361DB" /></linearGradient></defs>
        {STAGE_GEO.map((g, k) => (
          <g key={k}>
            <line x1={g.dot[0]} y1={g.dot[1]} x2={g.line[0]} y2={g.line[1]} stroke={k < lit ? 'rgba(3,97,219,.45)' : 'rgba(3,97,219,.18)'} strokeWidth="1.5" strokeDasharray="2 4" />
            <circle cx={g.dot[0]} cy={g.dot[1]} r={k === 4 ? 8 : 6} fill={k < lit ? '#0361DB' : '#fff'} stroke={k < lit ? '#0361DB' : '#9CC8FF'} strokeWidth="2.5" />
          </g>
        ))}
      </svg>
      {stages.map((s, k) => {
        const g = STAGE_GEO[k].pill;
        return <StagePill key={s} label={s} on={k < lit} className="absolute" style={{ left: g.left, top: g.top, transform: `translate(${g.x}, ${g.y})` }} />;
      })}
      {Array.from({ length: RCARDS }).map((_, i) => (
        <div key={i} ref={(el) => { cards.current[i] = el; }} className="absolute left-0 top-0 flex h-[44px] w-[120px] items-center gap-2 rounded-xl bg-white px-2.5 shadow-lift"
          style={{ offsetPath: `path("${PATH}")`, offsetRotate: '0deg', offsetAnchor: '50% 50%', offsetDistance: `${(0.25 + i * 0.25) * 100}%`, opacity: still ? 1 : 0 }}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-grad text-white"><UserRound className="h-3.5 w-3.5" /></span>
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

/* ---------- 3. Out-of-hours: 24h local-time dial with live UK / USA / Australia markers ----------
 * Each zone sits on the dial at its own current local hour (Intl time zones, so DST is always right).
 * The centre cycles through the zones every 3s; the 17:00–09:00 arc is re-drawn in the colour of the
 * zone in the centre, so it reads as "that zone's out-of-hours". Clicking a legend chip pins a zone. */
const ooh = services.items[2];
const ZONES = ooh.zones ?? [];
const ZONE_COLORS = ['#FFFFFF', '#5AA5FF', '#8B7BFF'];
const ZONE_ARC_END = ['#7DB8FF', '#1679E0', '#5B4FD6']; // arc gradient: zone colour -> deeper tone
const ZONE_EVERY = 3000;
// tiny shared store so the (scaled) dial and the (unscaled, phone) legend agree on the pinned zone
const zoneStore = { pinned: null as number | null, subs: new Set<() => void>() };
const pinZone = (i: number | null) => { zoneStore.pinned = i; zoneStore.subs.forEach((f) => f()); };
const usePinnedZone = () => useSyncExternalStore((f) => { zoneStore.subs.add(f); return () => { zoneStore.subs.delete(f); }; }, () => zoneStore.pinned, () => null);

/** Index of the zone shown in the centre: pinned, else auto-cycling (UK only with reduced motion). */
function useActiveZone(now: Date) {
  const pinned = usePinnedZone();
  if (pinned !== null) return pinned;
  if (prefersReducedMotion() || isHydrating()) return 0; // deterministic first render (matches the pre-rendered HTML)
  return Math.floor((now.getTime() - T0) / ZONE_EVERY) % ZONES.length;
}
const OFFICE = ooh.officeHours ?? { from: 9, to: 17 };
const isOffice = (h: number) => h >= OFFICE.from && h < OFFICE.to;

function ZoneLegend({ now, active, className }: { now: Date; active: number; className?: string }) {
  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)} onMouseLeave={() => pinZone(null)}>
      {ZONES.map((z, i) => (
        <button key={z.tz} type="button" onClick={() => pinZone(zoneStore.pinned === i ? null : i)} aria-pressed={active === i}
          className={cn('flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-[14px] font-semibold tabular-nums transition-colors duration-300',
            active === i ? 'border-white/25 bg-white/[0.12] text-white' : 'border-white/10 bg-white/[0.04] text-[#B9CBE4] hover:bg-white/[0.08]')}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ZONE_COLORS[i] }} />
          {z.short} <span className="text-white">{formatTime(z.tz, now)}</span>
        </button>
      ))}
    </div>
  );
}

/** Phones: legend under the scaled dial, at full size. */
function OohLegend() {
  const now = useNow(1000);
  const active = useActiveZone(now);
  return <ZoneLegend now={now} active={active} className="px-4 pb-6" />;
}

function OohArt({ compact = false }: { compact?: boolean }) {
  const now = useNow(1000);
  const [ref, on] = usePlay<HTMLDivElement>();
  const active = useActiveZone(now);
  const W = compact ? 340 : 440, cx = W / 2, cy = compact ? 170 : 200, R = compact ? 132 : 126;
  const ang = (h: number) => (h / 24) * 360 - 90; // 00:00 at the top
  const pt = (h: number, r: number) => [cx + r * Math.cos((ang(h) * Math.PI) / 180), cy + r * Math.sin((ang(h) * Math.PI) / 180)] as const;
  const [ax, ay] = pt(17, R), [bx, by] = pt(9, R);
  const arc = `M ${ax} ${ay} A ${R} ${R} 0 1 1 ${bx} ${by}`; // 17:00 → 09:00 clockwise (16h)
  const z = ZONES[active], zh = hourIn(z.tz, now);
  return (
    <div ref={ref} className="relative" style={{ width: W, height: compact ? 340 : 470 }}>
      <svg viewBox={`0 0 ${W} ${compact ? 340 : 400}`} className="absolute left-0 top-0 w-full" style={{ height: compact ? 340 : 400 }} aria-hidden>
        <defs>
          {ZONE_COLORS.map((c, i) => (
            <linearGradient key={i} id={`ooh${i}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={c} /><stop offset="1" stopColor={ZONE_ARC_END[i]} /></linearGradient>
          ))}
        </defs>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="16" />
        {Array.from({ length: 24 }).map((_, h) => {
          const [x1, y1] = pt(h, R + 13), [x2, y2] = pt(h, R + (h % 6 ? 17 : 21));
          return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke={h % 6 ? 'rgba(185,203,228,.25)' : 'rgba(185,203,228,.55)'} strokeWidth="1.5" strokeLinecap="round" />;
        })}
        <motion.path key={active} d={arc} fill="none" stroke={`url(#ooh${active})`} strokeWidth="16" strokeLinecap="round"
          initial={{ pathLength: on && !prefersReducedMotion() ? 0 : 1, opacity: 0.4 }} animate={on ? { pathLength: 1, opacity: 1 } : undefined} transition={{ duration: 1.1, ease: EASE }} />
        {[0, 6, 12, 18].map((h) => { const [x, y] = pt(h, R - 26); return <text key={h} x={x} y={y + 5} textAnchor="middle" fill="rgba(185,203,228,.85)" fontSize="13" fontWeight="600">{String(h).padStart(2, '0')}</text>; })}
        {ZONES.map((zz, i) => {
          const [x, y] = pt(hourIn(zz.tz, now), R);
          return (
            <g key={zz.tz}>
              {i === active && !prefersReducedMotion() && <circle cx={x} cy={y} r="9" fill="none" stroke={ZONE_COLORS[i]} strokeWidth="2" className="ooh-ping" style={{ transformOrigin: `${x}px ${y}px` }} />}
              <circle cx={x} cy={y} r="13" fill="#01152D" fillOpacity=".55" />
              <circle cx={x} cy={y} r={i === active ? 8 : 6.5} fill={ZONE_COLORS[i]} stroke="#01152D" strokeWidth="2.5" />
            </g>
          );
        })}
      </svg>
      {/* marker pills, pushed radially outside the ring */}
      {!compact && ZONES.map((zz, i) => {
        const [x, y] = pt(hourIn(zz.tz, now), R + 50);
        return (
          <span key={zz.tz} className={cn('absolute flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[13px] font-semibold tabular-nums leading-4 transition-colors duration-300',
            i === active ? 'border-white/25 bg-[#0B2547] text-white' : 'border-white/10 bg-[#071A33] text-[#B9CBE4]')}
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
            <span style={{ color: ZONE_COLORS[i] }}>{zz.short}</span>{formatTime(zz.tz, now)}
          </span>
        );
      })}
      {/* centre: crossfades between zones */}
      <div className="absolute flex items-center justify-center text-center" style={{ left: cx - 100, top: cy - 100, width: 200, height: 200 }}>
        <AnimatePresence initial={false}>
          <motion.div key={active} className="absolute inset-0 flex flex-col items-center justify-center" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.5, ease: EASE }}>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: active === 0 ? '#9CCBFF' : ZONE_COLORS[active] }}>{z.name}</span>
            <span className="mt-1.5 font-display text-[44px] font-semibold tabular-nums leading-none tracking-[-0.03em] text-white"><Clock value={formatTime(z.tz, now)} /></span>
            <span className={cn('mt-2.5 max-w-[17ch] text-balance text-[14px] font-medium leading-snug', isOffice(zh) ? 'text-[#B9CBE4]' : 'text-white')}>{isOffice(zh) ? ooh.statusOffice : ooh.statusOoh}</span>
          </motion.div>
        </AnimatePresence>
      </div>
      {!compact && <ZoneLegend now={now} active={active} className="absolute inset-x-0 bottom-0" />}
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

const arts: ((compact: boolean) => ReactNode)[] = [() => <RecruitmentArt />, () => <FinanceArt />, (c) => <OohArt compact={c} />, () => <BusinessArt />];
const artSize = [[520, 380], [420, 440], [440, 470], [420, 420]];
const artSizeCompact = [[520, 380], [420, 440], [340, 340], [420, 420]];

/** Scales a fixed-size illustration to fit its panel. The art is taken out of flow so its
 *  fixed width never widens the card. On desktop the panel height is set by the card (art scales to fit it);
 *  below lg the panel height follows the scale. */
function Fit({ i }: { i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const compact = useMedia('(max-width: 639px)');
  const lg = useMedia('(min-width: 1024px)');
  const [w, h] = (compact ? artSizeCompact : artSize)[i];
  const [s, setS] = useState(1);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setS(Math.min(1, (e.contentRect.width - 32) / w, lg ? (e.contentRect.height - 24) / h : 1)));
    ro.observe(el); return () => ro.disconnect();
  }, [w, h, lg]);
  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      <div ref={ref} className="relative w-full min-w-0 flex-1 overflow-hidden" style={{ minHeight: lg ? 360 : Math.round(h * s + 40) }}>
        <div className="absolute left-1/2 top-1/2" style={{ width: w, height: h, transform: `translate(-50%, -50%) scale(${s})` }}>{arts[i](compact)}</div>
      </div>
      {compact && i === 2 && <OohLegend />}
    </div>
  );
}

/* Stacking geometry (round 2: every card must fit the viewport, e.g. a 1366×650 laptop).
 * Sticky top = var(--nav-h) + 16px gap (round 3: one source for the header height), then 10px per stacked card.
 * Card height fills the rest of the viewport, clamped to 520–640px. Stacking is off below 1024px wide or 640px tall. */
const STEP = 10;
const STICK_CSS = 'calc(var(--nav-h) + 16px)';
const CARD_H = `min(640px, max(520px, calc(100svh - var(--nav-h) - 16px - ${32 + STEP * 3}px)))`;
const useStackable = () => useMedia('(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)');
type Geo = { top: number; vh: number; stick: number };

function Card({ i, scrollY, geo, stacked }: { i: number; scrollY: MotionValue<number>; geo: Geo; stacked: boolean }) {
  const s = services.items[i], t = themes[i], n = services.items.length;
  // Card i+1 slides over card i between: its top entering the viewport -> it sticking.
  const coverFrom = geo.top + i * geo.vh;
  const coverTo = geo.top + (i + 1) * geo.vh - geo.stick - (i + 1) * STEP;
  const last = i === n - 1;
  // covered cards keep their own colour: they settle at 0.96 scale and 85% opacity, so the 10px that
  // peeks above the next card reads as a deliberate deck (round 1 dimmed them with navy = grey "crop" edges)
  const scale = useTransform(scrollY, [coverFrom, Math.max(coverFrom + 1, coverTo)], [1, last ? 1 : 0.96]);
  // dim to ~85% with an overlay in the card's own tone (opacity would let the card underneath show through)
  const dim = useTransform(scrollY, [coverFrom + (coverTo - coverFrom) * 0.5, Math.max(coverFrom + 2, coverTo)], [0, last ? 0 : 1]);
  const lead = 'lead' in s && s.lead;
  const phone = useMedia('(max-width: 767px)');
  return (
    <motion.article style={stacked ? { scale, transformOrigin: 'top center', height: CARD_H } : undefined}
      className={cn('relative grid overflow-hidden rounded-[2rem] shadow-lift lg:min-h-[520px] lg:grid-cols-[52fr_48fr]', t.card)}>
      <div className="flex min-h-0 flex-col p-8 sm:p-11 lg:order-1 lg:p-10 xl:px-12">
        <span className={cn('font-display text-[15px] font-semibold tabular-nums tracking-[0.04em]', t.idx)}>0{i + 1}</span>
        {lead && <p className={cn('mt-4 font-display text-[18px] font-medium tracking-[-0.015em]', t.idx)}>{s.lead}</p>}
        <h3 className={cn('font-display text-[clamp(32px,3.4vw,48px)] font-semibold leading-[1.04] tracking-[-0.04em]', lead ? 'mt-2' : 'mt-4', t.title)}>{s.title.split(' ').map((w, k) => <span key={k} className={w.includes('-') ? 'whitespace-nowrap' : undefined}>{k > 0 && ' '}{w}</span>)}</h3>
        <p className={cn('mt-4 max-w-[60ch] text-[16px] leading-[1.6]', t.body)}>{s.body}</p>
        <p className={cn('mt-auto pt-6 text-[12px] font-semibold uppercase tracking-[0.14em]', t.idx)}>Services include</p>
        <ul className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">
          {s.list.map((x) => (
            <li key={x} className={cn('flex items-start gap-2.5 text-[15px] font-medium leading-snug', t.item)}>
              <span className={cn('mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-full', t.check)}><Check className="h-3 w-3" strokeWidth={3} /></span>{x}
            </li>
          ))}
        </ul>
      </div>
      <div className={cn('order-first m-3 min-h-0 rounded-[1.5rem] lg:order-2 lg:ml-0', t.panel)}>{i === 0 && phone ? <RecruitmentMobile /> : <Fit i={i} />}</div>
      {stacked && <motion.div aria-hidden style={{ opacity: dim }} className={cn('pointer-events-none absolute inset-0', t.dark ? 'bg-black/15' : 'bg-navy/[0.06]')} />}
    </motion.article>
  );
}

/** Slim "01 / 04" sequence indicator in the right gutter, sticky at mid-screen while the stack scrolls. */
function StackProgress({ scrollY, geo }: { scrollY: MotionValue<number>; geo: Geo }) {
  const n = services.items.length;
  const [idx, setIdx] = useState(0);
  const fill = useTransform(scrollY, [geo.top - geo.vh * 0.2, geo.top + (n - 1) * geo.vh], [1 / n, 1], { clamp: true });
  useMotionValueEvent(scrollY, 'change', (y) => setIdx(Math.min(n - 1, Math.max(0, Math.round((y - geo.top + geo.vh * 0.25) / geo.vh)))));
  return (
    <div className="pointer-events-none sticky top-1/2 z-10 h-0" aria-hidden>
      <div className="absolute -right-7 top-0 flex -translate-y-1/2 flex-col items-center gap-3 xl:-right-12">
        <span className="font-display text-[13px] font-semibold tabular-nums text-brand">0{idx + 1}</span>
        <span className="relative h-28 w-[3px] overflow-hidden rounded-full bg-navy/10">
          <motion.span className="absolute inset-x-0 top-0 h-full origin-top rounded-full bg-grad" style={{ scaleY: fill }} />
        </span>
        <span className="font-display text-[13px] font-semibold tabular-nums text-muted">0{n}</span>
      </div>
    </div>
  );
}

function Stack() {
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [geo, setGeo] = useState<Geo>({ top: 0, vh: 900, stick: 92 });
  useEffect(() => {
    const measure = () => wrap.current && setGeo({ top: wrap.current.getBoundingClientRect().top + scrollY.get(), vh: innerHeight, stick: navH() + 16 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [scrollY]);
  return (
    <div ref={wrap} className="relative mt-14">
      <StackProgress scrollY={scrollY} geo={geo} />
      {services.items.map((s, i) => (
        <div key={s.id} className="sticky h-[100vh] last:h-auto" style={{ top: `calc(${STICK_CSS} + ${i * STEP}px)` }}>
          <Card i={i} scrollY={scrollY} geo={geo} stacked />
        </div>
      ))}
    </div>
  );
}

export default function Services() {
  const pin = useStackable();
  const still = useMotionValue(0);
  const geo = { top: 0, vh: 1, stick: 0 };
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
