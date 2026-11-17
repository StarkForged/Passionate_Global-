/**
 * Mission / Vision / Values — "sticky scroll story" (Aceternity Sticky Scroll Reveal pattern, driven by
 * page scroll instead of an inner scroller). Reference: ref7 / ref8 hexagon badges.
 * One statement readable at a time; the sticky glass panel crossfades Mission (Target) → Vision (Eye) → Values
 * (honeycomb of mini glass hexagons) while the orb light behind it moves per step (round 2: no navy panel).
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Target, Eye, type LucideIcon } from 'lucide-react';
import { mission, vision, values, purpose } from '@/data/content';
import { EASE } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useMedia, usePinnable } from '@/hooks/useMedia';
import ValuesWheel, { valueIcons } from './ValuesWheel';
import { GlassBackdrop, GlassHexagon, GlassIcon, GlassPanel } from '@/components/ui/glass';
import { prefersReducedMotion } from '@/lib/scroll';


const blocks = [
  { label: purpose.missionLabel, text: mission },
  { label: purpose.visionLabel, text: vision },
  { label: purpose.valuesLabel, text: `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}.` },
];

/** Glass hexagon with a GlassIcon inside (round 2: no solid navy / blue shapes). */
function GlassBadge({ icon, size }: { icon: LucideIcon; size: number }) {
  return <GlassHexagon width={size} glow><GlassIcon icon={icon} size={Math.round(size * 0.3)} active /></GlassHexagon>;
}

/** Values: honeycomb of 6 mini glass hexagons; the lit one gets the blue-tint glass. */
function Honeycomb({ size = 96, animate = true }: { size?: number; animate?: boolean }) {
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (!animate || prefersReducedMotion()) return;
    const id = setInterval(() => setOn((v) => (v + 1) % 6), 1100);
    return () => clearInterval(id);
  }, [animate]);
  const h = size * 1.1547, gap = 8;
  // 3 columns x 2 rows, second row offset by half a cell (honeycomb)
  return (
    <div className="relative" style={{ width: size * 3.5 + gap * 3, height: h * 1.75 + gap }}>
      {valueIcons.map((Icon, i) => {
        const row = i < 3 ? 0 : 1, col = i % 3;
        return (
          <div key={i} className="absolute" style={{ left: col * (size + gap) + row * (size / 2 + gap / 2), top: row * (h * 0.75 + gap) }}>
            <GlassHexagon width={size} tint={on === i} glow={on === i} shadow={false}>
              <Icon style={{ width: size * 0.3, height: size * 0.3 }} strokeWidth={1.6} className={cn('transition-colors duration-500', on === i ? 'text-brand' : 'text-navy/70')} />
            </GlassHexagon>
          </div>
        );
      })}
    </div>
  );
}

/** Blur crossfade that ends at `filter: none` (a lingering blur(0) would stop the glass inside from blurring). */
const swap = {
  initial: { opacity: 0, scale: 0.96, filter: 'blur(10px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } },
  exit: { opacity: 0, scale: 1.03, filter: 'blur(10px)' },
};

/** The sticky panel: glass on a local orb backdrop whose light moves per step. */
function Panel({ step }: { step: number }) {
  return (
    <div className="relative isolate aspect-square w-full max-w-[480px]">
      <GlassBackdrop shift={step} dots={false} bare className="-inset-20" scale={0.9} />
      <GlassPanel className="absolute inset-0 grid place-items-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={step} {...swap} transition={{ duration: 0.6, ease: EASE }}>
            {step < 2 ? <GlassBadge icon={step === 0 ? Target : Eye} size={236} /> : <Honeycomb />}
          </motion.div>
        </AnimatePresence>
        <span className="glass absolute bottom-6 left-6 rounded-full px-3.5 py-1.5 text-[12px] font-semibold uppercase tabular-nums tracking-[0.14em] text-brand">
          0{step + 1} / 03
        </span>
      </GlassPanel>
    </div>
  );
}

function Story() {
  const wrap = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start center', 'end center'] });
  useMotionValueEvent(scrollYProgress, 'change', (p) => setStep(Math.min(2, Math.max(0, Math.floor(p * 3)))));
  return (
    <div className="container-site grid grid-cols-[1fr_480px] gap-20">
      <div ref={wrap}>
        {blocks.map((b, i) => (
          <div key={b.label} className="flex min-h-[72vh] flex-col justify-center">
            <motion.div animate={{ opacity: step === i ? 1 : 0.18 }} transition={{ duration: 0.5, ease: EASE }}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">{b.label}</p>
              <p className="mt-5 max-w-[22ch] font-display text-[clamp(2rem,2.8vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.035em] text-ink">{b.text}</p>
            </motion.div>
          </div>
        ))}
      </div>
      <div><div className="sticky top-[calc(50vh-240px)] my-[calc(36vh-240px)]"><Panel step={step} /></div></div>
    </div>
  );
}

/** Mobile / reduced motion: each statement with its own static visual. */
function StoryStatic() {
  const lg = useMedia('(min-width: 1024px)');
  return (
    <div className="container-site grid gap-20">
      {blocks.map((b, i) => (
        <motion.div key={b.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: EASE }}
          className="lg:grid lg:grid-cols-[1fr_440px] lg:items-center lg:gap-20">
          <div className="relative isolate aspect-[4/3] w-full lg:order-2 lg:aspect-square">
            <GlassBackdrop shift={i} dots={false} bare className="-inset-6" scale={0.6} />
            <GlassPanel className="absolute inset-0 grid place-items-center overflow-hidden">
              {i < 2 ? <GlassBadge icon={i === 0 ? Target : Eye} size={lg ? 210 : 140} /> : <Honeycomb size={lg ? 96 : 64} />}
            </GlassPanel>
          </div>
          <div>
            <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand lg:mt-0">{b.label}</p>
            <p className="mt-4 max-w-[24ch] font-display text-[clamp(1.6rem,6.4vw,2.25rem)] font-semibold leading-[1.18] tracking-[-0.035em] text-ink lg:text-[clamp(2rem,2.8vw,2.5rem)]">{b.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Purpose() {
  const pin = usePinnable();
  const lg = useMedia('(min-width: 1024px)');
  return (
    <section id="purpose" data-theme="light" className="relative overflow-x-clip bg-ice py-24 md:py-32 lg:py-24">
      <h2 className="sr-only">{purpose.srTitle}</h2>
      {pin ? <Story /> : <StoryStatic />}

      <div className="container-site mt-24 lg:mt-16">
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE }}
          className="text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">{purpose.coreValuesLabel}</motion.p>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.8, ease: EASE }}
          className="mt-10 lg:mt-6">
          <ValuesWheel ring={lg} />
        </motion.div>
      </div>
    </section>
  );
}
