/**
 * Core values — "Values wheel" (client round 1). Round 3: iOS-style Liquid Glass (client: the frosted glass blended
 * into the background). Desktop: a clear circular lens in the centre with real content BEHIND it to refract: an inner
 * ring + progress ring that run under the lens edge, six spokes that emerge from under it, and a saturated blue blob
 * drifting behind it. Six small liquid-glass nodes sit on the outer ring (active = brighter rim + blue inner glow).
 * Auto-advances every 2.5s; a thin glowing arc travels to the next node. Hover, focus or click selects a node and
 * pauses; leaving resumes. Arrow keys move between nodes (roving tabindex). On change the lens squashes and settles
 * while the content crossfades. Below lg: the lens on a smaller ring stage + a snap row of liquid-glass chips.
 * Reduced motion: no auto-advance, first value active, no squash / pointer parallax.
 */
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Handshake, ShieldCheck, Crosshair, Award, Sparkles, RefreshCw, type LucideIcon } from 'lucide-react';
import { values } from '@/data/content';
import { EASE } from '@/components/ui';
import { GlassBackdrop } from '@/components/ui/glass';
import { LensBlob, LiquidGlass, LiquidLayers, type LensShape } from '@/components/ui/liquid-glass';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scroll';

export const valueIcons: LucideIcon[] = [Handshake, ShieldCheck, Crosshair, Award, Sparkles, RefreshCw];
const EVERY = 2500;
const N = values.length;
/** Lens shape (round 3 compared circle vs SVG hexagon: the circle wins, see CLAUDE.md). */
const LENS_SHAPE: LensShape = 'circle';

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

/** Centre lens: navy name + brand icon with a soft glow; content crossfades while the lens squashes. */
function CentreLens({ active, size, track }: { active: number; size: number; track?: RefObject<HTMLElement> }) {
  const Icon = valueIcons[active];
  const hex = LENS_SHAPE === 'hexagon';
  return (
    <LiquidGlass shape={LENS_SHAPE} refract pulse={active} track={track} style={{ width: size, height: hex ? size * 1.1547 : size }}>
      <AnimatePresence initial={false}>
        <motion.div key={active} className="absolute inset-0 flex flex-col items-center justify-center px-7 text-center"
          initial={{ opacity: 0, filter: 'blur(6px)' }} animate={{ opacity: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }} exit={{ opacity: 0, filter: 'blur(6px)' }} transition={{ duration: 0.4, ease: EASE }}>
          <Icon className="lg-icon-glow text-brand" style={{ width: size * 0.15, height: size * 0.15 }} strokeWidth={1.7} />
          <span className="mt-3 text-balance font-display font-semibold leading-[1.08] tracking-[-0.035em] text-navy" style={{ fontSize: Math.round(size * 0.118) }}>{values[active]}</span>
        </motion.div>
      </AnimatePresence>
    </LiquidGlass>
  );
}

// per active value: the blob sits off-centre so its edge crosses the lens (half clear, half blue) and moves on each change
const BLOB_AT = [[86, -70], [96, 40], [-40, 96], [-96, 50], [-80, -76], [20, -104]] as const;

/* ---------------- Desktop ring ---------------- */
const S = 560, C = S / 2, R = 196, ICON = 56, LABEL_GAP = 50, LENS = 264, INNER = LENS / 2 - 14;
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
    <div ref={ref} role="group" aria-label="Core values" className="relative isolate mx-auto" style={{ width: S, height: S }}
      onMouseLeave={() => setPaused(false)} onKeyDown={onKey}>
      <GlassBackdrop shift={2} dots={false} bare className="-inset-24" scale={0.8} />
      <LensBlob radius={130} dx={BLOB_AT[active][0]} dy={BLOB_AT[active][1]} />
      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="vw-g" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5AA5FF" /><stop offset="1" stopColor="#0361DB" /></linearGradient>
          <filter id="vw-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        {/* outer ring (nodes sit on it) */}
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(3,97,219,.22)" strokeWidth="1.4" />
        {/* spokes: emerge from under the lens edge, so they visibly bend through it */}
        {values.map((_, k) => {
          const [a, b] = pos(k, LENS / 2 - 40), [c, d] = pos(k, R - ICON / 2 - 6);
          return <line key={k} x1={a} y1={b} x2={c} y2={d} stroke={k === active ? 'url(#vw-g)' : 'rgba(3,97,219,.3)'} strokeWidth={k === active ? 2.2 : 1.4} strokeLinecap="round" style={{ transition: 'stroke .4s' }} />;
        })}
        {/* inner rings + progress ring, running under the lens rim (strongest refraction band) */}
        <circle cx={C} cy={C} r={INNER} fill="none" stroke="rgba(3,97,219,.45)" strokeWidth="1.6" />
        <circle cx={C} cy={C} r={INNER - 22} fill="none" stroke="rgba(3,97,219,.4)" strokeWidth="1.4" strokeDasharray="2 6" />
        <circle cx={C} cy={C} r={LENS / 2 + 22} fill="none" stroke="rgba(3,97,219,.14)" strokeWidth="1" strokeDasharray="2 6" />
        {running && (
          <motion.circle key={`p${active}`} cx={C} cy={C} r={INNER} fill="none" stroke="url(#vw-g)" strokeWidth="3" strokeLinecap="round"
            transform={`rotate(${-90 + (360 / N) * active} ${C} ${C})`} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: EVERY / 1000, ease: 'linear' }} />
        )}
        {running && (
          <g key={active}>
            <motion.path d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`} fill="none" stroke="#5AA5FF" strokeWidth="5" strokeLinecap="round" filter="url(#vw-glow)" opacity={0.55}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: EVERY / 1000, ease: 'linear' }} />
            <motion.path d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`} fill="none" stroke="url(#vw-g)" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: EVERY / 1000, ease: 'linear' }} />
          </g>
        )}
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><CentreLens active={active} size={LENS} track={ref} /></div>

      {values.map((v, k) => {
        const [x, y] = pos(k);
        const on = k === active;
        const Icon = valueIcons[k];
        return (
          <div key={v}>
            <button ref={(el) => { nodes.current[k] = el; }} type="button" aria-label={v} aria-pressed={on} tabIndex={on ? 0 : -1}
              onMouseEnter={() => { setActive(k); setPaused(true); }} onFocus={() => { setActive(k); setPaused(true); }} onBlur={() => setPaused(false)}
              onClick={() => { setActive(k); setPaused(true); }}
              className={cn('absolute rounded-full transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]', on ? 'scale-[1.1]' : 'hover:-translate-y-0.5')}
              style={{ left: x - ICON / 2, top: y - ICON / 2, width: ICON, height: ICON }}>
              <LiquidGlass active={on} className="h-full w-full">
                <span className="grid h-full w-full place-items-center"><Icon className={cn('h-[22px] w-[22px] text-brand', on && 'lg-icon-glow')} strokeWidth={1.8} /></span>
              </LiquidGlass>
            </button>
            <span aria-hidden className={cn('pointer-events-none absolute max-w-[150px] font-display text-[17px] font-semibold leading-[1.2] tracking-[-0.015em] transition-colors duration-500', on ? 'text-brand' : 'text-ink')}
              style={labelStyle(k)}>{v}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Below lg: lens on a small ring stage + snap row of liquid-glass chips ---------------- */
function LensStage({ active, lens }: { active: number; lens: number }) {
  const S2 = lens + 88, c = S2 / 2, inner = lens / 2 - 12;
  return (
    <div className="relative" style={{ width: S2, height: S2 }}>
      <LensBlob radius={lens * 0.48} dx={BLOB_AT[active][0] * 0.75} dy={BLOB_AT[active][1] * 0.75} />
      <svg viewBox={`0 0 ${S2} ${S2}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx={c} cy={c} r={lens / 2 + 30} fill="none" stroke="rgba(3,97,219,.2)" strokeWidth="1.2" />
        <circle cx={c} cy={c} r={inner} fill="none" stroke="rgba(3,97,219,.45)" strokeWidth="1.6" />
        <circle cx={c} cy={c} r={inner - 18} fill="none" stroke="rgba(3,97,219,.28)" strokeWidth="1.2" strokeDasharray="2 6" />
        {values.map((_, k) => {
          const t = (-90 + (360 / N) * k) * (Math.PI / 180), r1 = lens / 2 - 30, r2 = lens / 2 + 30;
          return <line key={k} x1={c + r1 * Math.cos(t)} y1={c + r1 * Math.sin(t)} x2={c + r2 * Math.cos(t)} y2={c + r2 * Math.sin(t)} stroke={k === active ? '#0361DB' : 'rgba(3,97,219,.22)'} strokeWidth={k === active ? 2 : 1.2} strokeLinecap="round" style={{ transition: 'stroke .4s' }} />;
        })}
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><CentreLens active={active} size={lens} /></div>
    </div>
  );
}

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
      <LensStage active={active} lens={208} />
      <div ref={row} role="group" aria-label="Core values" onTouchStart={() => setPaused(true)}
        className="-mx-5 mt-6 flex w-[calc(100%+2.5rem)] snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-5 pt-1 [scrollbar-width:none] sm:-mx-8 sm:w-[calc(100%+4rem)] sm:px-8 [&::-webkit-scrollbar]:hidden">
        {values.map((v, k) => {
          const Icon = valueIcons[k];
          const on = k === active;
          return (
            <button key={v} ref={(el) => { chips.current[k] = el; }} type="button" aria-pressed={on} onClick={() => { setActive(k); setPaused(true); }}
              className={cn('lg lg-pill flex min-h-[48px] shrink-0 snap-center items-center gap-2 px-4 text-[15px] font-semibold text-navy', on && 'is-active')}>
              <LiquidLayers />
              <Icon className={cn('relative h-5 w-5 text-brand', on && 'lg-icon-glow')} strokeWidth={1.7} /><span className="relative">{v}</span>
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
