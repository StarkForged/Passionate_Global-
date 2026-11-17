/**
 * Core values — "Values wheel" (client round 1: replaces the full-width text rows).
 * Desktop: six value nodes on a thin ring around a brand hexagon (the Mission / Vision hexagon language).
 * Auto-advances every 2.5s; a progress arc travels to the next node. Hover, focus or click selects a node
 * and pauses; leaving resumes. Arrow keys move between nodes (roving tabindex).
 * Below lg: the centre hexagon plus a horizontal snap row of value chips.
 * Reduced motion: no auto-advance, first value active.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Handshake, ShieldCheck, Crosshair, Award, Sparkles, RefreshCw, type LucideIcon } from 'lucide-react';
import { values } from '@/data/content';
import { EASE } from '@/components/ui';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scroll';

export const valueIcons: LucideIcon[] = [Handshake, ShieldCheck, Crosshair, Award, Sparkles, RefreshCw];
export const HEX = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)';
const EVERY = 2500;
const N = values.length;

/** Auto-advancing index with pause; paused also while off-screen. */
function useCycle(inView: boolean) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const still = prefersReducedMotion();
  const running = inView && !paused && !still;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setActive((v) => (v + 1) % N), EVERY);
    return () => clearInterval(id);
  }, [running, active]); // restart the timer after a manual change so every value gets its full 2.5s
  return { active, setActive, paused, setPaused, running };
}

/** Centre hexagon: gradient fill, gloss, active value's icon + name (crossfades with a slight scale). */
function CentreHex({ active, width }: { active: number; width: number }) {
  const Icon = valueIcons[active];
  const h = width * 1.1547;
  return (
    <div className="relative" style={{ width, height: h, filter: 'drop-shadow(0 22px 34px rgba(3,97,219,.32))' }}>
      <div className="absolute inset-0" style={{ clipPath: HEX, background: 'linear-gradient(160deg,#6FB2FF 0%,#0361DB 52%,#0245A8 100%)' }} />
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,.5)_0%,rgba(255,255,255,0)_42%)]" style={{ clipPath: HEX }} />
      <AnimatePresence initial={false}>
        <motion.div key={active} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white"
          initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.5, ease: EASE }}>
          <Icon className="h-10 w-10" strokeWidth={1.6} />
          <span className="mt-4 text-balance font-display text-[clamp(1.6rem,2.4vw,2rem)] font-semibold leading-[1.08] tracking-[-0.035em]">{values[active]}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Desktop ring ---------------- */
const S = 560, C = S / 2, R = 196, NODE = 64, LABEL_GAP = 56;
const angle = (k: number) => (-90 + (360 / N) * k) * (Math.PI / 180);
const pos = (k: number, r = R) => [C + r * Math.cos(angle(k)), C + r * Math.sin(angle(k))] as const;
/** label anchor per node: outside the ring, never over it */
const labelStyle = (k: number) => {
  const [x, y] = pos(k, R + LABEL_GAP);
  const c = Math.cos(angle(k));
  if (Math.abs(c) < 0.01) return { left: x, top: y, transform: `translate(-50%, ${y < C ? '-100%' : '0'})`, textAlign: 'center' as const };
  return { left: x, top: y, transform: `translate(${c > 0 ? '0' : '-100%'}, -50%)`, textAlign: (c > 0 ? 'left' : 'right') as 'left' | 'right' };
};

function Ring() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const { active, setActive, setPaused, running } = useCycle(inView);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const [x1, y1] = pos(active), [x2, y2] = pos((active + 1) % N);

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (active + d + N) % N;
    setActive(next); nodes.current[next]?.focus();
  };

  return (
    <div ref={ref} role="group" aria-label="Core values" className="relative mx-auto" style={{ width: S, height: S }}
      onMouseLeave={() => setPaused(false)} onKeyDown={onKey}>
      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <defs><linearGradient id="vw-g" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5AA5FF" /><stop offset="1" stopColor="#0361DB" /></linearGradient></defs>
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(1,21,45,.1)" strokeWidth="1.5" />
        <circle cx={C} cy={C} r={R - 34} fill="none" stroke="rgba(1,21,45,.05)" strokeWidth="1" strokeDasharray="2 6" />
        {running && (
          <motion.path key={active} d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`} fill="none" stroke="url(#vw-g)" strokeWidth="3" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: EVERY / 1000, ease: 'linear' }} />
        )}
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><CentreHex active={active} width={212} /></div>

      {values.map((v, k) => {
        const Icon = valueIcons[k];
        const [x, y] = pos(k);
        const on = k === active;
        return (
          <div key={v}>
            <button ref={(el) => { nodes.current[k] = el; }} type="button" aria-label={v} aria-pressed={on} tabIndex={on ? 0 : -1}
              onMouseEnter={() => { setActive(k); setPaused(true); }} onFocus={() => { setActive(k); setPaused(true); }} onBlur={() => setPaused(false)}
              onClick={() => { setActive(k); setPaused(true); }}
              className={cn('absolute grid place-items-center rounded-full border transition-[transform,background-color,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
                on ? 'scale-[1.12] border-transparent bg-grad text-white shadow-[0_0_0_8px_rgba(3,97,219,.10),0_18px_40px_-12px_rgba(3,97,219,.6)]' : 'border-line bg-white text-brand shadow-soft hover:-translate-y-0.5')}
              style={{ left: x - NODE / 2, top: y - NODE / 2, width: NODE, height: NODE }}>
              <Icon className="h-6 w-6" strokeWidth={1.7} />
            </button>
            <span aria-hidden className={cn('pointer-events-none absolute max-w-[150px] font-display text-[17px] font-semibold leading-[1.2] tracking-[-0.015em] transition-colors duration-500', on ? 'text-brand' : 'text-ink')}
              style={labelStyle(k)}>{v}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Below lg: hexagon + snap row of chips ---------------- */
function Chips() {
  const ref = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const { active, setActive, setPaused } = useCycle(inView);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  // keep the active chip in view by scrolling the row only (never the page)
  useEffect(() => {
    const r = row.current, c = chips.current[active];
    if (!r || !c) return;
    r.scrollTo({ left: c.offsetLeft - (r.clientWidth - c.offsetWidth) / 2, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [active]);
  return (
    <div ref={ref} className="flex flex-col items-center">
      <CentreHex active={active} width={196} />
      <div ref={row} role="group" aria-label="Core values" onTouchStart={() => setPaused(true)}
        className="-mx-5 mt-10 flex w-[calc(100%+2.5rem)] snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:w-[calc(100%+4rem)] sm:px-8 [&::-webkit-scrollbar]:hidden">
        {values.map((v, k) => {
          const Icon = valueIcons[k];
          const on = k === active;
          return (
            <button key={v} ref={(el) => { chips.current[k] = el; }} type="button" aria-pressed={on} onClick={() => { setActive(k); setPaused(true); }}
              className={cn('flex min-h-[48px] shrink-0 snap-center items-center gap-2 rounded-full border px-4 text-[15px] font-semibold transition-colors duration-300',
                on ? 'border-transparent bg-grad text-white shadow-blue' : 'border-line bg-white text-ink shadow-soft')}>
              <Icon className={cn('h-5 w-5', on ? 'text-white' : 'text-brand')} strokeWidth={1.7} />{v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ValuesWheel({ ring }: { ring: boolean }) {
  return ring ? <Ring /> : <Chips />;
}
