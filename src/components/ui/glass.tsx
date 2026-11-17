/**
 * Glassmorphism system (client round 2, reference: top half of ref5). Light, frosted, slightly blue glass
 * on a soft orb backdrop. Rules:
 * - Glass needs something behind it: put a <GlassBackdrop/> in the section (or panel) first.
 * - Text on glass is ink / navy / brand (AA on the lightest and the bluest fill).
 * - No CSS `filter` / `opacity < 1` / `mask` on ANY ancestor of a glass element: those create a "backdrop
 *   root" and the blur then sees nothing. Shadows are drawn as siblings for that reason.
 * - Without backdrop-filter support the fill falls back to 85% white (see .glass in index.css).
 * - Orbs are radial gradients (no filter: blur) so drifting them costs nothing on the GPU.
 */
import { type CSSProperties, type ReactNode, useId } from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const HEX_CLIP = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)';
/** Hexagon as a mask: unlike clip-path, a mask also clips the backdrop blur (Chrome paints backdrop-filter
 *  across the whole box when only clip-path is set, which shows as a frosted rectangle). */
const HEX_MASK = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 115.47" preserveAspectRatio="none"><polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87"/></svg>')}")`;
const hexMask = { WebkitMaskImage: HEX_MASK, maskImage: HEX_MASK, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' } as CSSProperties;
const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------- Backdrop ---------------- */
type Orb = { x: string; y: string; size: number; color: string };
const ORB_COLORS = ['rgba(90,165,255,.35)', 'rgba(22,121,224,.20)', 'rgba(191,220,255,.50)'];
/** Orb layouts; `shift` picks one so a section can move its light per step (e.g. Mission / Vision / Values). */
const LAYOUTS: Orb[][] = [
  [{ x: '8%', y: '62%', size: 480, color: ORB_COLORS[0] }, { x: '70%', y: '10%', size: 380, color: ORB_COLORS[1] }, { x: '40%', y: '78%', size: 420, color: ORB_COLORS[2] }],
  [{ x: '72%', y: '8%', size: 480, color: ORB_COLORS[0] }, { x: '6%', y: '20%', size: 360, color: ORB_COLORS[1] }, { x: '58%', y: '70%', size: 420, color: ORB_COLORS[2] }],
  [{ x: '30%', y: '24%', size: 460, color: ORB_COLORS[0] }, { x: '80%', y: '64%', size: 400, color: ORB_COLORS[1] }, { x: '4%', y: '76%', size: 380, color: ORB_COLORS[2] }],
];

/** `bare`: orbs only (no ice→white fill), for a local light cluster behind one element. */
export function GlassBackdrop({ shift = 0, dots = true, bare = false, className, scale = 1 }: { shift?: number; dots?: boolean; bare?: boolean; className?: string; scale?: number }) {
  const orbs = LAYOUTS[shift % LAYOUTS.length];
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10', !bare && 'overflow-hidden bg-[linear-gradient(180deg,#EFF4F9_0%,#FFFFFF_100%)]', className)}>
      {orbs.map((o, i) => (
        <motion.div key={i} className="absolute" initial={false} animate={{ left: o.x, top: o.y }} transition={{ duration: 1.4, ease: EASE }}
          style={{ width: o.size * scale, height: o.size * scale, marginLeft: (-o.size * scale) / 2, marginTop: (-o.size * scale) / 2 }}>
          <div className={cn('glass-orb h-full w-full rounded-full', `glass-orb-${i}`)} style={{ background: `radial-gradient(closest-side, ${o.color}, transparent)` }} />
        </motion.div>
      ))}
      {dots && <div className="absolute inset-0 bg-[radial-gradient(rgba(3,97,219,.10)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(55%_55%_at_50%_50%,#000,transparent)]" />}
    </div>
  );
}

/* ---------------- Panel ---------------- */
export function GlassPanel({ children, tint = false, className, style }: { children?: ReactNode; tint?: boolean; className?: string; style?: CSSProperties }) {
  return <div className={cn('glass rounded-[2rem]', tint && 'glass-tint', className)} style={style}>{children}</div>;
}

/* ---------------- Icon ---------------- */
/** Frosted disc with a soft blue glow, brand icon and two thin arc rings that rotate on hover (of a `group`). */
export function GlassIcon({ icon: Icon, size = 64, active = false, className }: { icon: LucideIcon; size?: number; active?: boolean; className?: string }) {
  const outer = Math.round(size * 1.5);
  return (
    <span className={cn('relative inline-grid shrink-0 place-items-center', className)} style={{ width: outer, height: outer }}>
      <svg viewBox="0 0 100 100" className={cn('glass-icon-rings absolute inset-0 h-full w-full', active && 'is-active')} aria-hidden>
        {[-130, 50].map((r) => <circle key={r} cx="50" cy="50" r="47" fill="none" stroke={active ? 'rgba(3,97,219,.45)' : 'rgba(3,97,219,.18)'} strokeWidth="1.6" strokeDasharray="62 86" strokeLinecap="round" transform={`rotate(${r} 50 50)`} />)}
        {[-40, 140].map((r) => <circle key={r} cx="50" cy="50" r="41" fill="none" stroke={active ? 'rgba(3,97,219,.32)' : 'rgba(3,97,219,.12)'} strokeWidth="1.2" strokeDasharray="30 99" strokeLinecap="round" transform={`rotate(${r} 50 50)`} />)}
      </svg>
      <span className={cn('glass-disc relative grid place-items-center rounded-full transition-[box-shadow,background] duration-500', active && 'is-active')} style={{ width: size, height: size }}>
        <Icon className="relative text-brand" style={{ width: size * 0.4, height: size * 0.4 }} strokeWidth={1.7} />
      </span>
    </span>
  );
}

/* ---------------- Hexagon ---------------- */
/** Frosted hexagon (masked, see HEX_MASK). The mask removes CSS borders, so the border + top-left highlight are an SVG overlay;
 *  the shadow is a blurred sibling (a filter on an ancestor would kill the backdrop blur). */
/** `shadow={false}` for tightly packed hexagons (a neighbour's blurred shadow shows as a box edge through the glass). */
export function GlassHexagon({ width, tint = true, children, className, glow = false, shadow = true }: { width: number; tint?: boolean; children?: ReactNode; className?: string; glow?: boolean; shadow?: boolean }) {
  const h = width * 1.1547;
  const id = useId().replace(/:/g, '');
  // hexagon points in a 100 x 115.47 box
  const P = '50,1 99,29.2 99,86.3 50,114.5 1,86.3 1,29.2';
  return (
    <div className={cn('relative', className)} style={{ width, height: h }}>
      {shadow && <div aria-hidden className="absolute inset-x-[8%] top-[14%] h-full blur-2xl"><div className="h-full w-full bg-[rgba(3,60,140,.12)]" style={{ clipPath: HEX_CLIP }} /></div>}
      {glow && <div aria-hidden className="absolute inset-[-12%] rounded-full bg-[radial-gradient(closest-side,rgba(90,165,255,.22),transparent)]" />}
      <div className={cn('glass-hex absolute inset-0', tint && 'glass-tint')} style={hexMask} />
      <svg viewBox="0 0 100 115.47" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`hl${id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".95" /><stop offset=".45" stopColor="#fff" stopOpacity=".25" /><stop offset="1" stopColor="#fff" stopOpacity=".55" /></linearGradient>
          <linearGradient id={`sh${id}`} x1="0" y1="0" x2=".7" y2=".8"><stop stopColor="#fff" stopOpacity=".55" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /></linearGradient>
        </defs>
        <polygon points={P} fill={`url(#sh${id})`} />
        <polygon points={P} fill="none" stroke={`url(#hl${id})`} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
