/**
 * Core values — "Values wheel" (client round 1), in glass since round 2 (client: no solid blue hexagon).
 * Desktop: six GlassIcon nodes on a thin ring around a blue-tint GlassHexagon on a soft orb backdrop.
 * Auto-advances every 2.5s; a thin glowing arc travels to the next node. Hover, focus or click selects a node
 * and pauses; leaving resumes. Arrow keys move between nodes (roving tabindex).
 * Below lg: the glass hexagon plus a horizontal snap row of glass chips.
 * Reduced motion: no auto-advance, first value active, no tilt.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Handshake, ShieldCheck, Crosshair, Award, Sparkles, RefreshCw, type LucideIcon } from 'lucide-react';
import { values } from '@/data/content';
import { EASE } from '@/components/ui';
import { GlassBackdrop, GlassHexagon, GlassIcon, HEX_CLIP } from '@/components/ui/glass';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scroll';

export const valueIcons: LucideIcon[] = [Handshake, ShieldCheck, Crosshair, Award, Sparkles, RefreshCw];
export const HEX = HEX_CLIP;
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

/** Centre: blue-tint glass hexagon; navy icon (with a soft glow behind it) + name; blur crossfade + gentle tilt. */
function CentreHex({ active, width }: { active: number; width: number }) {
  const Icon = valueIcons[active];
  const still = prefersReducedMotion();
  return (
    <div style={{ perspective: 900 }}>
      <motion.div initial={false} animate={still ? undefined : { rotateY: [0, active % 2 ? -6 : 6, 0], rotateX: [0, active % 2 ? 3 : -3, 0] }}
        transition={{ duration: 0.8, ease: EASE }} style={{ transformStyle: 'preserve-3d' }}>
        <GlassHexagon width={width} glow>
          <AnimatePresence initial={false}>
            <motion.div key={active} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(8px)' }} transition={{ duration: 0.4, ease: EASE }}>
              <span className="relative grid place-items-center">
                <span aria-hidden className="absolute h-20 w-20 rounded-full bg-[radial-gradient(closest-side,rgba(3,97,219,.18),transparent)]" />
                <Icon className="relative h-10 w-10 text-brand" strokeWidth={1.6} />
              </span>
              <span className="mt-4 text-balance font-display text-[clamp(1.75rem,2.4vw,2.125rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-navy">{values[active]}</span>
            </motion.div>
          </AnimatePresence>
        </GlassHexagon>
      </motion.div>
    </div>
  );
}

/* ---------------- Desktop ring ---------------- */
const S = 560, C = S / 2, R = 196, ICON = 56, LABEL_GAP = 58;
const angle = (k: number) => (-90 + (360 / N) * k) * (Math.PI / 180);
const pos = (k: number, r = R) => [C + r * Math.cos(angle(k)), C + r * Math.sin(angle(k))] as const;
/** label anchor per node: outside the ring (and the node's arc rings), never over it */
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
  const outer = ICON * 1.5;

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (active + d + N) % N;
    setActive(next); nodes.current[next]?.focus();
  };

  return (
    <div ref={ref} role="group" aria-label="Core values" className="relative isolate mx-auto" style={{ width: S, height: S }}
      onMouseLeave={() => setPaused(false)} onKeyDown={onKey}>
      <GlassBackdrop shift={2} dots={false} bare className="-inset-24" scale={0.8} />
      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="vw-g" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5AA5FF" /><stop offset="1" stopColor="#0361DB" /></linearGradient>
          <filter id="vw-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(3,97,219,.16)" strokeWidth="1.2" />
        <circle cx={C} cy={C} r={R - 34} fill="none" stroke="rgba(3,97,219,.08)" strokeWidth="1" strokeDasharray="2 6" />
        {running && (
          <g key={active}>
            <motion.path d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`} fill="none" stroke="#5AA5FF" strokeWidth="5" strokeLinecap="round" filter="url(#vw-glow)" opacity={0.55}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: EVERY / 1000, ease: 'linear' }} />
            <motion.path d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`} fill="none" stroke="url(#vw-g)" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: EVERY / 1000, ease: 'linear' }} />
          </g>
        )}
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><CentreHex active={active} width={216} /></div>

      {values.map((v, k) => {
        const [x, y] = pos(k);
        const on = k === active;
        return (
          <div key={v}>
            <button ref={(el) => { nodes.current[k] = el; }} type="button" aria-label={v} aria-pressed={on} tabIndex={on ? 0 : -1}
              onMouseEnter={() => { setActive(k); setPaused(true); }} onFocus={() => { setActive(k); setPaused(true); }} onBlur={() => setPaused(false)}
              onClick={() => { setActive(k); setPaused(true); }}
              className={cn('group absolute grid place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]', on ? 'scale-[1.08]' : 'hover:-translate-y-0.5')}
              style={{ left: x - outer / 2, top: y - outer / 2, width: outer, height: outer }}>
              <GlassIcon icon={valueIcons[k]} size={ICON} active={on} />
            </button>
            <span aria-hidden className={cn('pointer-events-none absolute max-w-[150px] font-display text-[17px] font-semibold leading-[1.2] tracking-[-0.015em] transition-colors duration-500', on ? 'text-brand' : 'text-ink')}
              style={labelStyle(k)}>{v}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Below lg: glass hexagon + snap row of glass chips ---------------- */
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
    <div ref={ref} className="relative isolate flex flex-col items-center">
      <GlassBackdrop shift={2} dots={false} bare className="-inset-x-10 -top-10 bottom-16" scale={0.6} />
      <CentreHex active={active} width={196} />
      <div ref={row} role="group" aria-label="Core values" onTouchStart={() => setPaused(true)}
        className="-mx-5 mt-10 flex w-[calc(100%+2.5rem)] snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-3 pt-1 [scrollbar-width:none] sm:-mx-8 sm:w-[calc(100%+4rem)] sm:px-8 [&::-webkit-scrollbar]:hidden">
        {values.map((v, k) => {
          const Icon = valueIcons[k];
          const on = k === active;
          return (
            <button key={v} ref={(el) => { chips.current[k] = el; }} type="button" aria-pressed={on} onClick={() => { setActive(k); setPaused(true); }}
              className={cn('glass flex min-h-[48px] shrink-0 snap-center items-center gap-2 rounded-full px-4 text-[15px] font-semibold text-navy transition-shadow duration-300',
                on && 'glass-tint !shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(3,97,219,.5),0_0_18px_rgba(90,165,255,.45)]')}>
              <Icon className="h-5 w-5 text-brand" strokeWidth={1.7} />{v}
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
