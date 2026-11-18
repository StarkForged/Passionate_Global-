/**
 * Mission / Vision / Values — "sticky scroll story" (Aceternity Sticky Scroll Reveal pattern, driven by
 * page scroll instead of an inner scroller). One statement readable at a time.
 * Round 4 (client rejected the glass looks and loved ref-c): the sticky visual is one luminous edge-lit screen
 * (`PurposeScreen`) on a clean ice background (faint grid + one soft top-left light beam; no blurred orbs).
 * Mobile / reduced motion: the screen sits above each statement (not sticky).
 */
import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { mission, vision, values, purpose } from '@/data/content';
import { EASE } from '@/components/ui';
import { useMedia, usePinnable } from '@/hooks/useMedia';
import ValuesWheel from './ValuesWheel';
import PurposeScreen from './PurposeScreen';
import { FaintGrid, Flare } from '@/components/ui/luminous';

const blocks = [
  { label: purpose.missionLabel, text: mission },
  { label: purpose.visionLabel, text: vision },
  { label: purpose.valuesLabel, text: `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}.` },
];

function Story() {
  const wrap = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start center', 'end center'] });
  useMotionValueEvent(scrollYProgress, 'change', (p) => setStep(Math.min(2, Math.max(0, Math.floor(p * 3)))));
  return (
    <div className="container-site grid grid-cols-[1fr_520px] gap-16 xl:gap-20">
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
      <div>
        <div className="sticky top-[max(calc(var(--nav-h)+16px),calc(50vh-180px))] my-[calc(36vh-180px)]">
          <Flare className="left-10 -top-32" />
          <PurposeScreen step={step} counter />
        </div>
      </div>
    </div>
  );
}

/** Mobile / reduced motion: each statement with its own screen above it. */
function StoryStatic() {
  const lg = useMedia('(min-width: 1024px)');
  return (
    <div className="container-site grid gap-20">
      {blocks.map((b, i) => (
        <motion.div key={b.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: EASE }}
          className="lg:grid lg:grid-cols-[1fr_520px] lg:items-center lg:gap-16">
          <div className="relative lg:order-2">
            <PurposeScreen step={i} compact={!lg} />
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
      <FaintGrid />
      <h2 className="sr-only">{purpose.srTitle}</h2>
      <div className="relative">{pin ? <Story /> : <StoryStatic />}</div>

      <div className="container-site relative mt-24 lg:mt-16">
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
