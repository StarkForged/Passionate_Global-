/**
 * The luminous screen for Mission / Vision / Values (client round 4, reference ref-c in our palette).
 * One LuminousScreen (16:11); its inside changes per step and every GlowLine re-draws when its step appears:
 *  - Mission: growth curve (flat, then rising) with a head dot + dotted guide; chrome pills from the statement.
 *  - Vision: dotted world (geo.json, white 35%) with glowing arcs from Ahmedabad to the UK, Europe, US and Australia.
 *  - Values: six GlowTiles (3 x 2) linked by thin lines that light up one by one.
 * Drawing space 520 x 358 (scaled with the screen); text (pills, labels) stays at real size (>= 13px).
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Target, Eye, Gem } from 'lucide-react';
import { countries, purpose } from '@/data/content';
import { ChromePill, GlowLine, GlowTile, LuminousScreen } from '@/components/ui/luminous';
import { prefersReducedMotion } from '@/lib/scroll';
import { cn } from '@/lib/utils';
import { valueIcons } from './ValuesWheel';

const W = 520, H = 358;
const pct = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });
const EASE = [0.22, 1, 0.36, 1] as const;

function Label({ icon: Icon, children }: { icon: typeof Target; children: ReactNode }) {
  return (
    <div className="absolute left-4 top-4 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#CFE3FF] sm:left-6 sm:top-5">
      <Icon className="glow-icon h-4 w-4 text-white" strokeWidth={2} />{children}
    </div>
  );
}

/** Pill that fades in after its line has drawn. */
function Pill({ x, y, anchor = 'left', delay = 0, children }: { x: number; y: number; anchor?: 'left' | 'right'; delay?: number; children: ReactNode }) {
  return (
    <motion.div className="absolute" style={{ ...pct(x, y), translate: anchor === 'right' ? '-100% 0' : undefined }}
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: prefersReducedMotion() ? 0 : delay, ease: EASE }}>
      <ChromePill>{children}</ChromePill>
    </motion.div>
  );
}

/* ---------------- Mission ---------------- */
const GROWTH = 'M 36 262 L 214 262 C 300 262 372 226 476 86';
function MissionScene() {
  const [a, b] = purpose.screenPills.mission;
  return (
    <>
      <GlowLine d={GROWTH} width={W} height={H} baseline={300} strokeWidth={3} className="absolute inset-0 h-full w-full" />
      <Label icon={Target}>{purpose.missionLabel}</Label>
      <Pill x={36} y={222} delay={0.2}>{a}</Pill>
      <Pill x={488} y={42} anchor="right" delay={1.4}>{b}</Pill>
    </>
  );
}

/* ---------------- Vision ---------------- */
const X0 = 28, X1 = 492, LAT_T = 78, LAT_B = -56, Y0 = 60, Y1 = 326;
const proj = (lat: number, lng: number) => [X0 + ((lng + 180) / 360) * (X1 - X0), Y0 + ((LAT_T - lat) / (LAT_T - LAT_B)) * (Y1 - Y0)] as const;
const GA = Math.PI * (3 - Math.sqrt(5));
let dotsCache: [number, number][] | null = null;
/** Land dots from geo.json (loaded lazily: it is otherwise only in the hero globe chunk), snapped to an 8px grid. */
function useWorldDots() {
  const [dots, setDots] = useState(dotsCache);
  useEffect(() => {
    if (dotsCache) return;
    let live = true;
    import('@/data/geo.json').then((m) => {
      const { n, idx } = (m.default as { globe: { n: number; idx: number[] } }).globe;
      const seen = new Set<string>(); const out: [number, number][] = []; let i = 0;
      for (const d of idx) {
        i += d;
        const lat = (Math.asin(1 - (i / (n - 1)) * 2) * 180) / Math.PI;
        const lng = (((i * GA * 180) / Math.PI) % 360) - 180;
        if (lat > LAT_T || lat < LAT_B) continue;
        const [x, y] = proj(lat, lng);
        const gx = Math.round(x / 7) * 7, gy = Math.round(y / 7) * 7, k = `${gx},${gy}`;
        if (!seen.has(k)) { seen.add(k); out.push([gx, gy]); }
      }
      dotsCache = out; if (live) setDots(out);
    });
    return () => { live = false; };
  }, []);
  return dots;
}
const ARC_TO = ['GB', 'EU', 'US', 'AU'];
function VisionScene() {
  const dots = useWorldDots();
  const hub = proj(countries.hub.lat, countries.hub.lng);
  const arcs = useMemo(() => ARC_TO.map((code) => {
    const c = countries.items.find((m) => m.code === code)!;
    const [x, y] = proj(c.lat, c.lng), dist = Math.hypot(x - hub[0], y - hub[1]);
    const mx = (x + hub[0]) / 2, my = Math.min(y, hub[1]) - dist * 0.32;
    return `M ${hub[0]} ${hub[1]} Q ${mx} ${my} ${x} ${y}`;
  }), [hub]);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
        {dots?.map(([x, y], k) => <circle key={k} cx={x} cy={y} r="1.5" fill="rgba(255,255,255,.35)" />)}
        <circle cx={hub[0]} cy={hub[1]} r="9" fill="rgba(156,203,255,.3)" />
        <circle cx={hub[0]} cy={hub[1]} r="4" fill="#fff" className="glow-stroke" />
      </svg>
      {arcs.map((d, k) => <GlowLine key={d} d={d} width={W} height={H} strokeWidth={2} duration={1.3} delay={0.25 + k * 0.25} className="absolute inset-0 h-full w-full" />)}
      <Label icon={Eye}>{purpose.visionLabel}</Label>
      <Pill x={496} y={20} anchor="right" delay={0.6}>{purpose.screenPills.vision}</Pill>
    </>
  );
}

/* ---------------- Values ---------------- */
const CELL = [[160, 158], [260, 158], [360, 158], [160, 262], [260, 262], [360, 262]] as const;
const ORDER = [0, 1, 2, 5, 4, 3]; // snake: lines link consecutive tiles
function ValuesScene({ tile }: { tile: number }) {
  const still = prefersReducedMotion();
  const [lit, setLit] = useState(still ? 6 : 1);
  useEffect(() => {
    if (still) return;
    const id = setInterval(() => setLit((v) => (v >= 8 ? 1 : v + 1)), 700); // 6 lit, hold 2 ticks, restart
    return () => clearInterval(id);
  }, [still]);
  const n = Math.min(6, lit);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
        {ORDER.slice(1).map((c, k) => {
          const [x1, y1] = CELL[ORDER[k]], [x2, y2] = CELL[c], on = k + 1 < n;
          return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? '#fff' : 'rgba(207,227,255,.18)'} strokeWidth={on ? 2 : 1.2} className={on ? 'glow-stroke' : undefined} style={{ transition: 'stroke .4s' }} />;
        })}
      </svg>
      {ORDER.map((c, k) => {
        const Icon = valueIcons[c];
        return (
          <div key={c} className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(CELL[c][0], CELL[c][1])}>
            <GlowTile icon={Icon} size={tile} active={k === n - 1} dim={k >= n} />
          </div>
        );
      })}
      <Label icon={Gem}>{purpose.valuesLabel}</Label>
      <Pill x={496} y={20} anchor="right" delay={0.3}>{purpose.screenPills.values}</Pill>
    </>
  );
}

/** The screen; `counter` shows "0x / 03" (sticky story only). */
export default function PurposeScreen({ step, counter = false, compact = false, className }: { step: number; counter?: boolean; compact?: boolean; className?: string }) {
  return (
    <LuminousScreen radius={compact ? 22 : 26} sheen={step} className={cn('aspect-[16/11] w-full', className)}>
      <AnimatePresence initial={false}>
        <motion.div key={step} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }}>
          {step === 0 ? <MissionScene /> : step === 1 ? <VisionScene /> : <ValuesScene tile={compact ? 44 : 56} />}
        </motion.div>
      </AnimatePresence>
      {counter && <ChromePill className="absolute bottom-5 left-6 tabular-nums tracking-[0.08em]">0{step + 1} / 03</ChromePill>}
    </LuminousScreen>
  );
}
