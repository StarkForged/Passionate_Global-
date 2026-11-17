/**
 * Mission / Vision / Values — "sticky scroll story" (Aceternity Sticky Scroll Reveal pattern, driven by
 * page scroll instead of an inner scroller). Reference: ref7 / ref8 hexagon badges.
 * One statement readable at a time; the sticky panel morphs hexagon → white hexagon → honeycomb.
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Target, Eye, type LucideIcon } from 'lucide-react';
import { mission, vision, values, purpose } from '@/data/content';
import { EASE } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useMedia, usePinnable } from '@/hooks/useMedia';
import ValuesWheel, { valueIcons, HEX } from './ValuesWheel';


const blocks = [
  { label: purpose.missionLabel, text: mission },
  { label: purpose.visionLabel, text: vision },
  { label: purpose.valuesLabel, text: `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}.` },
];

/** Glossy hexagon badge. `tone` blue = brand glass, white = pearl. */
function Hex({ tone, icon: Icon, size, layoutId, lit = true }: { tone: 'blue' | 'white'; icon: LucideIcon; size: number; layoutId?: string; lit?: boolean }) {
  const blue = tone === 'blue';
  return (
    <motion.div layoutId={layoutId} className="relative" style={{ width: size, height: size * 1.1547, filter: `drop-shadow(0 ${size / 10}px ${size / 7}px ${blue ? 'rgba(3,97,219,.38)' : 'rgba(1,21,45,.22)'})` }}
      transition={{ duration: 0.8, ease: EASE }}>
      <motion.div className="absolute inset-0" style={{ clipPath: HEX }}
        animate={{ background: blue ? 'linear-gradient(160deg,#6FB2FF 0%,#0361DB 52%,#0245A8 100%)' : 'linear-gradient(160deg,#FFFFFF 0%,#E3EEFB 70%,#C9DDF5 100%)', opacity: lit ? 1 : 0.55 }}
        transition={{ duration: 0.6, ease: EASE }} />
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,.6)_0%,rgba(255,255,255,0)_42%)]" style={{ clipPath: HEX }} />
      <div className="absolute inset-0 grid place-items-center">
        <Icon style={{ width: size * 0.32, height: size * 0.32 }} strokeWidth={1.6} className={blue ? 'text-white' : 'text-brand'} />
      </div>
    </motion.div>
  );
}

function Honeycomb({ size = 104, animate = true }: { size?: number; animate?: boolean }) {
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setOn((v) => (v + 1) % 6), 1100);
    return () => clearInterval(id);
  }, [animate]);
  const h = size * 1.1547, gap = 10;
  // 3 columns x 2 rows, second row offset by half a cell (honeycomb)
  return (
    <div className="relative" style={{ width: size * 3.5 + gap * 3, height: h * 1.75 + gap }}>
      {valueIcons.map((Icon, i) => {
        const row = i < 3 ? 0 : 1, col = i % 3;
        return (
          <div key={i} className="absolute" style={{ left: col * (size + gap) + row * (size / 2 + gap / 2), top: row * (h * 0.75 + gap) }}>
            <Hex tone={on === i ? 'blue' : 'white'} icon={Icon} size={size} layoutId={i === 0 ? 'purpose-hex' : undefined} />
          </div>
        );
      })}
    </div>
  );
}

/** The sticky panel's three states. */
function Panel({ step }: { step: number }) {
  // stacked backgrounds crossfaded by opacity (tweening gradient strings bands badly)
  const bgs = ['radial-gradient(90% 80% at 30% 15%,#FFFFFF 0%,#E2EDFA 100%)', 'radial-gradient(110% 100% at 25% 0%,#0E4590 0%,#03224A 45%,#01152D 80%)', 'radial-gradient(90% 80% at 70% 15%,#FFFFFF 0%,#E2EDFA 100%)'];
  return (
    <div className="relative grid aspect-square w-full max-w-[480px] place-items-center overflow-hidden rounded-[2rem] shadow-lift">
      {bgs.map((b, i) => (
        <motion.div key={i} aria-hidden className="absolute inset-0" style={{ background: b }} initial={false} animate={{ opacity: step === i ? 1 : 0 }} transition={{ duration: 0.8, ease: EASE }} />
      ))}
      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          {step < 2 ? (
            <motion.div key="single" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <Hex tone={step === 0 ? 'blue' : 'white'} icon={step === 0 ? Target : Eye} size={230} layoutId="purpose-hex" />
            </motion.div>
          ) : (
            <motion.div key="comb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <Honeycomb />
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
      <span className={cn('absolute bottom-6 left-7 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors duration-700', step === 1 ? 'text-sky' : 'text-brand')}>
        0{step + 1} / 03
      </span>
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
  return (
    <div className="container-site grid gap-20">
      {blocks.map((b, i) => (
        <motion.div key={b.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: EASE }}>
          <div className={cn('grid aspect-[4/3] w-full place-items-center rounded-[2rem] shadow-soft', i === 1 ? 'bg-[radial-gradient(100%_90%_at_30%_10%,#0B3A7A_0%,#01152D_70%)]' : 'bg-[radial-gradient(90%_80%_at_30%_15%,#FFFFFF_0%,#E2EDFA_100%)]')}>
            {i < 2 ? <Hex tone={i === 0 ? 'blue' : 'white'} icon={i === 0 ? Target : Eye} size={130} /> : <Honeycomb size={66} />}
          </div>
          <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">{b.label}</p>
          <p className="mt-4 font-display text-[clamp(1.6rem,6.4vw,2.25rem)] font-semibold leading-[1.18] tracking-[-0.035em] text-ink">{b.text}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function Purpose() {
  const pin = usePinnable();
  const lg = useMedia('(min-width: 1024px)');
  return (
    <section id="purpose" data-theme="light" className="relative bg-ice py-24 md:py-32 lg:py-24">
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
