/**
 * Core values — "Values wheel" (client round 1). Round 4: luminous style (reference ref-c; the round-3 liquid lens and
 * blue background spots were rejected). Desktop: a 560px ring on a clean background. Centre = a rounded-square
 * LuminousScreen (240px, radius 40) with the active value's white icon (glow) + name; a white shine sweeps across it
 * on every change. Six GlowTile nodes on a thin ring (active = stronger rim + sky glow + scale 1.1; others 85%).
 * The ring segment from the previous to the active node draws as a GlowLine with a glowing head dot.
 * Auto-advances every 2.5s; hover, focus or click selects and pauses; leaving resumes; arrow keys move (roving tabindex).
 * Below lg: the centre screen + a snap row of dark glossy pills (ref-a). Reduced motion: no auto-advance / sweeps.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Handshake, ShieldCheck, Crosshair, Award, Sparkles, RefreshCw, type LucideIcon } from 'lucide-react';
import { values } from '@/data/content';
import { EASE } from '@/components/ui';
import { GlowLine, GlowTile, LuminousScreen } from '@/components/ui/luminous';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scroll';

export const valueIcons: LucideIcon[] = [Handshake, ShieldCheck, Crosshair, Award, Sparkles, RefreshCw];
const EVERY = 2500;
const N = values.length;

/** Auto-advancing index with pause; paused also while off-screen. Tracks the previous index for the ring segment. */
function useCycle(inView: boolean) {
  const [state, setState] = useState({ active: 0, prev: N - 1 });
  const [paused, setPaused] = useState(false);
  const still = prefersReducedMotion();
  const running = inView && !paused && !still;
  const setActive = (k: number | ((v: number) => number)) =>
    setState((s) => { const n = typeof k === 'function' ? k(s.active) : k; return n === s.active ? s : { active: n, prev: s.active }; });
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setActive((v) => (v + 1) % N), EVERY);
    return () => clearInterval(id);
  }, [running, state.active]); // restart the timer after a manual change so every value gets its full 2.5s
  return { active: state.active, prev: state.prev, setActive, setPaused };
}

/** Centre: rounded-square luminous screen; icon + name crossfade, one shine sweep per change. */
function CentreScreen({ active, size }: { active: number; size: number }) {
  const Icon = valueIcons[active];
  return (
    <LuminousScreen radius={Math.round(size / 6)} sheen={active} style={{ width: size, height: size }}>
      <AnimatePresence initial={false}>
        <motion.div key={active} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4, ease: EASE }}>
          <Icon className="glow-icon text-white" style={{ width: size / 6, height: size / 6 }} strokeWidth={1.7} />
          <span className="mt-3 text-balance font-display font-semibold leading-[1.1] tracking-[-0.03em] text-white" style={{ fontSize: Math.round(size * 0.117) }}>{values[active]}</span>
        </motion.div>
      </AnimatePresence>
    </LuminousScreen>
  );
}

/* ---------------- Desktop ring ---------------- */
const S = 560, C = S / 2, R = 196, ICON = 56, LABEL_GAP = 50;
const angle = (k: number) => (-90 + (360 / N) * k) * (Math.PI / 180);
const pos = (k: number, r = R) => [C + r * Math.cos(angle(k)), C + r * Math.sin(angle(k))] as const;
/** label anchor per node: outside the ring, never over it */
const labelStyle = (k: number) => {
  const [x, y] = pos(k, R + LABEL_GAP);
  const c = Math.cos(angle(k));
  if (Math.abs(c) < 0.01) return { left: x, top: y, transform: `translate(-50%, ${y < C ? '-100%' : '0'})`, textAlign: 'center' as const };
  return { left: x, top: y, transform: `translate(${c > 0 ? '0' : '-100%'}, -50%)`, textAlign: (c > 0 ? 'left' : 'right') as 'left' | 'right' };
};
/** ring arc from node a to node b, the short way round */
const arc = (a: number, b: number) => {
  const fwd = (b - a + N) % N, cw = fwd <= N / 2;
  const [x1, y1] = pos(a), [x2, y2] = pos(b);
  return `M ${x1} ${y1} A ${R} ${R} 0 0 ${cw ? 1 : 0} ${x2} ${y2}`;
};
const RING_GRAD = <linearGradient id="vw-line" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5AA5FF" /><stop offset="1" stopColor="#0361DB" /></linearGradient>;

function Ring() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const { active, prev, setActive, setPaused } = useCycle(inView);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);

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
      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(3,97,219,.25)" strokeWidth="1.2" />
      </svg>
      {/* progress segment: previous -> active node, with a glowing head dot */}
      <GlowLine key={`${prev}-${active}`} d={arc(prev, active)} width={S} height={S} duration={0.8} whenInView={false} strokeWidth={2.5}
        stroke="url(#vw-line)" defs={RING_GRAD} className="absolute inset-0 h-full w-full" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><CentreScreen active={active} size={240} /></div>

      {values.map((v, k) => {
        const [x, y] = pos(k);
        const on = k === active;
        return (
          <div key={v}>
            <button ref={(el) => { nodes.current[k] = el; }} type="button" aria-label={v} aria-pressed={on} tabIndex={on ? 0 : -1}
              onMouseEnter={() => { setActive(k); setPaused(true); }} onFocus={() => { setActive(k); setPaused(true); }} onBlur={() => setPaused(false)}
              onClick={() => { setActive(k); setPaused(true); }}
              className={cn('absolute grid place-items-center rounded-[17px] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]', on ? 'scale-110' : 'hover:-translate-y-0.5')}
              style={{ left: x - ICON / 2, top: y - ICON / 2, width: ICON, height: ICON }}>
              <GlowTile icon={valueIcons[k]} size={ICON} active={on} dim={!on} />
            </button>
            <span aria-hidden className={cn('pointer-events-none absolute max-w-[150px] font-display text-[17px] font-semibold leading-[1.2] tracking-[-0.015em] transition-colors duration-500', on ? 'text-brand' : 'text-navy')}
              style={labelStyle(k)}>{v}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Below lg: centre screen + snap row of dark glossy pills ---------------- */
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
    <div ref={ref} className="relative flex flex-col items-center">
      <CentreScreen active={active} size={220} />
      <div ref={row} role="group" aria-label="Core values" onTouchStart={() => setPaused(true)}
        className="-mx-5 mt-8 flex w-[calc(100%+2.5rem)] snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-5 pt-2 [scrollbar-width:none] sm:-mx-8 sm:w-[calc(100%+4rem)] sm:px-8 [&::-webkit-scrollbar]:hidden">
        {values.map((v, k) => {
          const Icon = valueIcons[k];
          const on = k === active;
          return (
            <button key={v} ref={(el) => { chips.current[k] = el; }} type="button" aria-pressed={on} onClick={() => { setActive(k); setPaused(true); }}
              className={cn('glow-tile flex min-h-[48px] shrink-0 snap-center items-center gap-2 rounded-full px-4 text-[15px] font-semibold text-white', on ? 'is-active' : 'is-dim')}>
              <Icon className={cn('relative z-[1] h-5 w-5', on && 'glow-icon')} strokeWidth={1.8} /><span className="relative z-[1]">{v}</span>
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
