/**
 * Process — "sticky counter + tracing beam". Left: giant step number that rolls like an odometer,
 * a progress ring and "Step x of 6" (sticky). Right: Aceternity Timeline pattern — a gradient beam
 * traces down the steps with scroll; each step has a small brand hexagon icon (ref3 nod).
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { Search, PencilRuler, UserCheck, Plug, LifeBuoy, TrendingUp, type LucideIcon } from 'lucide-react';
import { process as proc } from '@/data/content';
import { Button, EASE, Reveal, SectionHeader } from '@/components/ui';
import { BorderBeam } from '@/components/magicui';
import { cn } from '@/lib/utils';

const icons: LucideIcon[] = [Search, PencilRuler, UserCheck, Plug, LifeBuoy, TrendingUp];
const HEX = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)';
const n = proc.steps.length;

/** Rolling digit strip (odometer). */
function Odometer({ value }: { value: number }) {
  const y = useSpring(value, { stiffness: 120, damping: 20 });
  useEffect(() => y.set(value), [value, y]);
  const translate = useTransform(y, (v) => `${-v}em`); // em: % would be relative to the whole strip
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-top leading-none">
      <motion.span className="flex flex-col" style={{ y: translate }}>
        {proc.steps.map((_, i) => <span key={i} className="text-grad block h-[1em] leading-none">{i + 1}</span>)}
      </motion.span>
    </span>
  );
}

function Counter({ step, progress }: { step: number; progress: ReturnType<typeof useSpring> }) {
  const R = 54, C = 2 * Math.PI * R;
  const dash = useTransform(progress, (p) => C * (1 - p));
  return (
    <div className="sticky top-[calc(50vh-190px)]">
      <p aria-live="polite" className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand">Step {step + 1} of {n}</p>
      <p className="mt-2 font-display text-[clamp(10rem,14vw,12.5rem)] font-semibold leading-none tracking-[-0.06em]" aria-hidden>
        <span className="text-outline">0</span><Odometer value={step} />
      </p>
      <div className="mt-6 flex items-center gap-5">
        <svg width="72" height="72" viewBox="0 0 120 120" className="-rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(1,21,45,.08)" strokeWidth="8" />
          <motion.circle cx="60" cy="60" r={R} fill="none" stroke="url(#pg)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: dash }} />
          <defs><linearGradient id="pg"><stop stopColor="#5AA5FF" /><stop offset="1" stopColor="#0361DB" /></linearGradient></defs>
        </svg>
        <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">
          {proc.steps[step].title}
        </motion.p>
      </div>
    </div>
  );
}

export default function Process() {
  const track = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ['start 55%', 'end 55%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  useMotionValueEvent(scrollYProgress, 'change', (p) => setStep(Math.min(n - 1, Math.max(0, Math.floor(p * n)))));

  return (
    <section id="process" data-theme="light" className="section bg-white">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
          <SectionHeader align="left" tag={proc.eyebrow} title={proc.title} highlight={['Lasting']} />
          <Reveal delay={0.1}><p className="text-[17px] leading-[1.75] text-muted">{proc.intro}</p></Reveal>
        </div>

        <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-[0.8fr_1fr] lg:gap-24">
          <div className="hidden lg:block"><Counter step={step} progress={progress} /></div>

          <div ref={track} className="relative">
            {/* base line + scroll-traced gradient beam */}
            <div className="absolute bottom-6 left-[27px] top-6 w-0.5 rounded-full bg-navy/[0.08]" aria-hidden />
            <motion.div className="absolute left-[27px] top-6 w-0.5 origin-top rounded-full bg-gradient-to-b from-sky via-brand to-brand" style={{ scaleY: progress, bottom: 24 }} aria-hidden />

            <ol className="relative">
              {proc.steps.map((s, i) => {
                const Icon = icons[i];
                const on = i <= step;
                return (
                  <li key={s.title} className="relative flex gap-7 pb-16 last:pb-0 sm:gap-9 lg:min-h-[38vh] lg:pb-20">
                    <span className="relative z-10 grid h-[62px] w-14 shrink-0 place-items-center" style={{ clipPath: HEX }}>
                      <span className={cn('absolute inset-0 transition-colors duration-500', on ? 'bg-grad' : 'bg-ice')} />
                      <Icon className={cn('relative h-6 w-6 transition-colors duration-500', on ? 'text-white' : 'text-brand')} strokeWidth={1.6} />
                    </span>
                    <div className="pt-2">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand">Step 0{i + 1}</p>
                      <h3 className={cn('mt-2 font-display text-[clamp(1.6rem,2.4vw,2rem)] font-semibold leading-tight tracking-[-0.035em] transition-colors duration-500', on ? 'text-ink' : 'text-ink/45')}>{s.title}</h3>
                      <p className={cn('mt-3 max-w-[48ch] text-[17px] leading-[1.7] transition-colors duration-500', on ? 'text-muted' : 'text-muted/60')}>{s.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <Reveal className="mt-20 flex justify-center lg:mt-24">
          <span className="relative inline-flex rounded-full">
            <Button href="#contact" size="lg">{proc.cta}</Button>
            <BorderBeam size={80} duration={6} colorFrom="#FFFFFF" colorTo="#9CCBFF" />
          </span>
        </Reveal>
      </div>
    </section>
  );
}
