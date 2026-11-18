/**
 * Luminous edge-lit glass (client round 4; reference: feedback-round1/docs/feedback/round4/ref-c, converted to our palette).
 * Deliberate dark-blue "screens" placed on the light page: a crisp rounded object with a bright thin white rim that glows
 * (backlit glass sheet), blue light bleeding in from the bottom / right edges, a fine grid fading towards the edges, live
 * white line drawings, chrome pill labels. Small elements = GlowTile (ref-a / ref-b).
 * All opaque CSS: no backdrop-filter, so it is cheap and identical in every browser. No blurred colour orbs anywhere.
 */
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { BorderBeam } from '@/components/magicui';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scroll';

/* ---------------- LuminousScreen ---------------- */
type ScreenProps = {
  radius?: number;
  /** change to play a single white shine across the interior (e.g. on value change) */
  sheen?: unknown;
  /** slow white/sky highlight travelling along the rim */
  beam?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export function LuminousScreen({ radius = 26, sheen, beam = true, className, style, children }: ScreenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [sweep, setSweep] = useState(0);
  const first = useRef(true);
  const still = prefersReducedMotion();

  // pointer: the top-left highlight and a hot spot on the rim drift towards the cursor (subtle)
  useEffect(() => {
    const el = ref.current;
    if (!el || still || !matchMedia('(hover: hover)').matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--lx', `${e.clientX - r.left}px`); el.style.setProperty('--ly', `${e.clientY - r.top}px`);
      el.style.setProperty('--lo', '1');
    };
    const leave = () => el.style.setProperty('--lo', '0');
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [still]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!still) setSweep((v) => v + 1);
  }, [sheen, still]);

  return (
    <div ref={ref} className={cn('lum relative', className)} style={{ borderRadius: radius, ...style }}>
      <div aria-hidden className="lum-inner">
        <div className="lum-grid" />
        <div className="lum-hot" />
        {sweep > 0 && (
          <motion.div key={sweep} className="lum-sheen" initial={{ x: '-130%' }} animate={{ x: '130%' }} transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }} />
        )}
      </div>
      <div className="relative z-[2] h-full w-full">{children}</div>
      <span aria-hidden className="lum-rim-glow2" />
      <span aria-hidden className="lum-rim-glow1" />
      <span aria-hidden className="lum-rim" />
      <span aria-hidden className="lum-rim-hot" />
      {beam && !still && <BorderBeam size={140} duration={6} colorFrom="#FFFFFF" colorTo="#9CCBFF" borderWidth={1.5} className="z-[3]" />}
    </div>
  );
}

/* ---------------- GlowLine ---------------- */
type GlowLineProps = {
  /** path in viewBox units */
  d: string;
  width: number;
  height: number;
  /** y of the baseline the dotted guide drops to; omit for no guide */
  baseline?: number;
  /** change to re-draw */
  play?: unknown;
  duration?: number;
  ease?: 'easeOut' | 'linear';
  /** draw only once in view */
  whenInView?: boolean;
  strokeWidth?: number;
  dot?: boolean;
  /** stroke paint (default white; on the light page pass a gradient url so the line stays visible) */
  stroke?: string;
  /** extra <defs> (e.g. that gradient) */
  defs?: ReactNode;
  className?: string;
};

/** White glowing line that draws itself, with a travelling head dot and an optional dotted guide down to the baseline. */
export function GlowLine({ d, width, height, baseline, play, duration = 1.6, ease = 'easeOut', whenInView = true, strokeWidth = 2.5, dot = true, stroke = '#fff', defs, className }: GlowLineProps) {
  const wrap = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);
  const guide = useRef<SVGLineElement>(null);
  const inView = useInView(wrap, { once: true, amount: 0.3 });
  const go = !whenInView || inView;

  useEffect(() => {
    const p = path.current; if (!p || !go) return;
    const L = p.getTotalLength();
    const set = (t: number) => {
      p.style.strokeDasharray = `${L}`; p.style.strokeDashoffset = `${L * (1 - t)}`;
      const pt = p.getPointAtLength(L * t);
      head.current?.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      if (guide.current) { guide.current.setAttribute('x1', `${pt.x}`); guide.current.setAttribute('x2', `${pt.x}`); guide.current.setAttribute('y1', `${pt.y + 8}`); }
    };
    if (prefersReducedMotion()) { set(1); return; }
    set(0);
    const c = animate(0, 1, { duration, ease, onUpdate: set });
    return () => c.stop();
  }, [d, play, go, duration, ease]);

  return (
    <svg ref={wrap} viewBox={`0 0 ${width} ${height}`} className={cn('pointer-events-none overflow-visible', className)} aria-hidden>
      {defs && <defs>{defs}</defs>}
      {baseline !== undefined && dot && <line ref={guide} x1="0" x2="0" y1="0" y2={baseline} stroke="rgba(207,227,255,.55)" strokeWidth="1.2" strokeDasharray="2 4" />}
      <path ref={path} d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className="glow-stroke" style={{ strokeDasharray: 1e5, strokeDashoffset: 1e5 }} />
      {dot && (
        <g ref={head} transform="translate(-99 -99)">
          <circle r="8" fill="rgba(156,203,255,.35)" />
          <circle r="3.5" fill="#fff" stroke={stroke === '#fff' ? 'none' : '#0361DB'} strokeWidth="1.5" className="glow-stroke" />
        </g>
      )}
    </svg>
  );
}

/* ---------------- ChromePill ---------------- */
export function ChromePill({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <span className={cn('chrome-pill', className)} style={style}>{children}</span>;
}

/* ---------------- GlowTile ---------------- */
/** Dark-blue glossy squircle with a bright rim, inner top highlight and soft sky edge glow; white icon. Sizes 48/56/64. */
export function GlowTile({ icon: Icon, size = 56, active = false, dim = false, className }: { icon: LucideIcon; size?: number; active?: boolean; dim?: boolean; className?: string }) {
  return (
    <span className={cn('glow-tile', active && 'is-active', dim && 'is-dim', className)} style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}>
      <Icon className={cn('relative z-[1] text-white', active && 'glow-icon')} style={{ width: size * 0.42, height: size * 0.42 }} strokeWidth={1.8} />
    </span>
  );
}

/* ---------------- Page background ---------------- */
/** Clean light background helpers: a very faint 32px grid fading at the edges, and one soft top-left light flare. */
export function FaintGrid({ className }: { className?: string }) {
  return <div aria-hidden className={cn('page-grid pointer-events-none absolute inset-0', className)} />;
}
export function Flare({ className }: { className?: string }) {
  return <div aria-hidden className={cn('lum-flare pointer-events-none absolute', className)} />;
}
