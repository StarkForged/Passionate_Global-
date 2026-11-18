/**
 * Mission / Vision / Values — "sticky scroll story" (Aceternity Sticky Scroll Reveal pattern, driven by
 * page scroll instead of an inner scroller). One statement readable at a time.
 * Round 3 (client: the frosted glass blended into the background): the sticky panel is a very light card with a crisp
 * dot grid and a vivid blue blob; a clear iOS-style Liquid Glass lens sits over them, so the dots and the blob edge
 * visibly bend through it. Mission (Target) -> Vision (Eye) -> Values (six icons, one lit at a time). On each step the
 * lens squashes and settles while its content crossfades; the blob moves (bottom-left / top-right / centre-left).
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Target, Eye } from 'lucide-react';
import { mission, vision, values, purpose } from '@/data/content';
import { EASE } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useMedia, usePinnable } from '@/hooks/useMedia';
import ValuesWheel, { valueIcons } from './ValuesWheel';
import { GlassBackdrop } from '@/components/ui/glass';
import { LensBlob, LiquidGlass, LiquidLayers } from '@/components/ui/liquid-glass';
import { prefersReducedMotion } from '@/lib/scroll';


const blocks = [
  { label: purpose.missionLabel, text: mission },
  { label: purpose.visionLabel, text: vision },
  { label: purpose.valuesLabel, text: `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}.` },
];

/** Values inside the lens: the six value icons, one lit (brand + soft glow) at a time. */
function ValuesGrid({ size, animate = true }: { size: number; animate?: boolean }) {
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (!animate || prefersReducedMotion()) return;
    const id = setInterval(() => setOn((v) => (v + 1) % 6), 1100);
    return () => clearInterval(id);
  }, [animate]);
  const icon = Math.round(size * 0.13);
  return (
    <div className="grid grid-cols-3" style={{ gap: `${Math.round(size * 0.07)}px ${Math.round(size * 0.09)}px` }}>
      {valueIcons.map((Icon, i) => (
        <Icon key={i} style={{ width: icon, height: icon }} strokeWidth={1.7}
          className={cn('transition-[color,filter] duration-500', on === i ? 'lg-icon-glow text-brand' : 'text-navy/55')} />
      ))}
    </div>
  );
}

/** Blob offset per step, as a fraction of the lens size: Mission bottom-left, Vision top-right, Values centre-left. */
const BLOB = [[-0.3, 0.26], [0.3, -0.26], [-0.38, 0.04]] as const;

/** Light card + dot grid + blob, with the liquid lens over them. */
function LensPanel({ step, lens, counter = false, className }: { step: number; lens: number; counter?: boolean; className?: string }) {
  const [bx, by] = BLOB[step];
  const content = step === 0 ? <Target className="lg-icon-glow text-brand" style={{ width: lens * 0.3, height: lens * 0.3 }} strokeWidth={1.5} />
    : step === 1 ? <Eye className="lg-icon-glow text-brand" style={{ width: lens * 0.3, height: lens * 0.3 }} strokeWidth={1.5} />
    : <ValuesGrid size={lens} />;
  return (
    <div className={cn('relative overflow-hidden rounded-[2rem] border border-white bg-[linear-gradient(160deg,#FFFFFF_0%,#EDF3FA_100%)] shadow-[0_24px_60px_-28px_rgba(3,60,140,.32)]', className)}>
      <LensBlob radius={lens * 0.46} dx={bx * lens} dy={by * lens} />
      {/* crisp dots above the blob, so both bend through the lens */}
      <div aria-hidden className="lg-dots absolute inset-0 [mask-image:radial-gradient(closest-side,#000_60%,transparent)]" />
      <div className="absolute inset-0 grid place-items-center">
        <LiquidGlass refract pulse={step} style={{ width: lens, height: lens }}>
          <AnimatePresence initial={false}>
            <motion.div key={step} className="absolute inset-0 grid place-items-center"
              initial={{ opacity: 0, scale: 0.94, filter: 'blur(6px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }} exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }} transition={{ duration: 0.45, ease: EASE }}>
              {content}
            </motion.div>
          </AnimatePresence>
        </LiquidGlass>
      </div>
      {counter && (
        <span className="lg lg-pill absolute bottom-6 left-6 px-3.5 py-1.5 text-[12px] font-semibold uppercase tabular-nums tracking-[0.14em] text-brand">
          <LiquidLayers /><span className="relative">0{step + 1} / 03</span>
        </span>
      )}
    </div>
  );
}

/** The sticky panel, on a soft local orb glow whose light moves per step. */
function Panel({ step }: { step: number }) {
  return (
    <div className="relative isolate aspect-square w-full max-w-[480px]">
      <GlassBackdrop shift={step} dots={false} bare className="-inset-20" scale={0.9} />
      <LensPanel step={step} lens={264} counter className="absolute inset-0" />
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
      <div><div className="sticky top-[max(calc(var(--nav-h)+16px),calc(50vh-240px))] my-[calc(36vh-240px)]"><Panel step={step} /></div></div>
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
            <LensPanel step={i} lens={lg ? 232 : 168} className="absolute inset-0" />
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
