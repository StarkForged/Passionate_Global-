/** Why choose us — "bento that proves it". Each tile carries a small, slow visual of its own claim. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, UserRound } from 'lucide-react';
import { why } from '@/data/content';
import { EASE, Reveal, SectionHeader } from '@/components/ui';
import { BentoGrid } from '@/components/magicui';
import { GlowingEffect } from '@/components/aceternity';
import { prefersReducedMotion } from '@/lib/scroll';
import { cn } from '@/lib/utils';

/** true once the element has been seen (or immediately with reduced motion). */
function useSeen<T extends Element>(amount = 0.5) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount });
  return [ref, inView || prefersReducedMotion()] as const;
}

/* ---- tile visuals (labels come from each item's body copy) ---- */
function Sliders() {
  const [ref, on] = useSeen<HTMLDivElement>();
  const rows = [{ l: 'People', from: 0.15, to: 0.72 }, { l: 'Processes', from: 0.8, to: 0.46 }, { l: 'Support', from: 0.3, to: 0.88 }];
  return (
    <div ref={ref} className="w-full max-w-[300px] space-y-5">
      {rows.map((r, i) => (
        <div key={r.l}>
          <p className="mb-2 text-[13px] font-medium text-muted">{r.l}</p>
          <div className="relative h-1.5 rounded-full bg-navy/[0.08]">
            <motion.div className="absolute inset-y-0 left-0 rounded-full bg-grad" initial={{ width: `${r.from * 100}%` }} animate={on ? { width: `${r.to * 100}%` } : undefined} transition={{ duration: 2.2, ease: EASE, delay: 0.3 + i * 0.25 }} />
            <motion.span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-brand shadow-soft" initial={{ left: `${r.from * 100}%` }} animate={on ? { left: `${r.to * 100}%` } : undefined} transition={{ duration: 2.2, ease: EASE, delay: 0.3 + i * 0.25 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Checklist() {
  const [ref, on] = useSeen<HTMLUListElement>();
  const items = ['Responsibility for the work', 'Proactive communication', 'Always adding value'];
  return (
    <ul ref={ref} className="w-full max-w-[260px] divide-y divide-navy/[0.07] rounded-2xl bg-white px-4 shadow-soft">
      {items.map((t, i) => (
        <li key={t} className="flex items-center gap-3 py-3">
          <motion.span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2" initial={{ borderColor: 'rgba(1,21,45,.15)', backgroundColor: 'rgba(3,97,219,0)' }}
            animate={on ? { borderColor: '#0361DB', backgroundColor: '#0361DB' } : undefined} transition={{ duration: 0.4, delay: 0.8 + i * 0.9 }}>
            <motion.span initial={{ scale: 0 }} animate={on ? { scale: 1 } : undefined} transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.95 + i * 0.9 }}>
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </motion.span>
          </motion.span>
          <span className="text-[14px] font-medium text-ink">{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Dedicated() {
  return (
    <div className="relative grid place-items-center">
      {[0, 1].map((k) => (
        <span key={k} className="absolute h-32 w-32 rounded-full border border-brand/30 motion-safe:animate-[ping-soft_3.6s_ease-out_infinite]" style={{ animationDelay: `${k * 1.8}s` }} />
      ))}
      <span className="relative grid h-32 w-32 place-items-center rounded-full bg-grad text-white shadow-blue">
        <UserRound className="h-14 w-14" strokeWidth={1.4} />
      </span>
      <span className="relative -mt-4 rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-brand shadow-soft">Exclusively yours</span>
    </div>
  );
}

/** what the team integrates into (from the item's body copy) */
function DedicatedFit() {
  const [ref, on] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className="flex flex-col items-center gap-14">
      <Dedicated />
      <div className="flex flex-col items-center gap-2.5">
        {['Your workflows', 'Your systems', 'Your culture'].map((t, i) => (
          <motion.span key={t} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-ink shadow-soft"
            initial={{ opacity: 0, y: 10 }} animate={on ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.6, ease: EASE, delay: 0.6 + i * 0.25 }}>
            <Check className="h-3.5 w-3.5 text-brand" strokeWidth={2.5} />{t}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function Dial() {
  const [ref, on] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className="relative h-[120px] w-[220px]">
      <svg viewBox="0 0 220 120" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="rgba(1,21,45,.08)" strokeWidth="10" strokeLinecap="round" />
        <path d="M92 22 A90 90 0 0 1 128 22" fill="none" stroke="#0361DB" strokeWidth="10" strokeLinecap="round" />
        {Array.from({ length: 11 }).map((_, i) => {
          const a = Math.PI - (i / 10) * Math.PI, r1 = 74, r2 = i === 5 ? 62 : 68;
          return <line key={i} x1={110 + r1 * Math.cos(a)} y1={110 - r1 * Math.sin(a)} x2={110 + r2 * Math.cos(a)} y2={110 - r2 * Math.sin(a)} stroke={i === 5 ? '#0361DB' : 'rgba(1,21,45,.2)'} strokeWidth="2" strokeLinecap="round" />;
        })}
      </svg>
      <motion.div className="absolute bottom-[10px] left-1/2 h-[78px] w-[3px] origin-bottom -translate-x-1/2 rounded-full bg-navy"
        initial={{ rotate: -70 }} animate={on ? { rotate: [-70, 38, -18, 9, -4, 0] } : undefined} transition={{ duration: 3, ease: 'easeInOut', delay: 0.4 }} />
      <span className="absolute bottom-[3px] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-white bg-navy shadow-soft" />
    </div>
  );
}

function Timeline() {
  const [ref, on] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className="w-full max-w-[460px] px-2">
      <div className="relative h-1.5 rounded-full bg-navy/[0.08]">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-grad" initial={{ width: '0%' }} animate={on ? { width: '100%' } : undefined} transition={{ duration: 4, ease: 'linear', delay: 0.4 }} />
      </div>
      <div className="relative -mt-[13px] flex justify-between">
        {[1, 2, 3, 4, 5].map((y, i) => (
          <div key={y} className="flex flex-col items-center gap-3">
            <motion.span className="h-5 w-5 rounded-full border-[3px] border-white shadow-soft" initial={{ backgroundColor: '#D5E2F2' }} animate={on ? { backgroundColor: '#0361DB' } : undefined} transition={{ duration: 0.3, delay: 0.4 + i * 1 }} />
            <motion.span className="text-[13px] font-semibold tabular-nums" initial={{ color: '#8A97A8' }} animate={on ? { color: '#0A1A30' } : undefined} transition={{ duration: 0.3, delay: 0.4 + i * 1 }}>Year {y}</motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Scale() {
  const [ref, inView] = useSeen<HTMLDivElement>(0.4);
  const steps = [2, 4, 8];
  const [k, setK] = useState(prefersReducedMotion() ? 2 : 0);
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    const id = setInterval(() => setK((v) => (v + 1) % steps.length), 2200);
    return () => clearInterval(id);
  }, [inView]);
  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.span key={i} className="grid h-9 w-9 place-items-center rounded-full" initial={false}
            animate={i < steps[k] ? { scale: 1, backgroundColor: '#0361DB', opacity: 1 } : { scale: 0.7, backgroundColor: '#D5E2F2', opacity: 0.6 }}
            transition={{ duration: 0.5, ease: EASE, delay: i < steps[k] ? (i % (steps[k] / 2 || 1)) * 0.08 : 0 }}>
            <UserRound className="h-4 w-4 text-white" strokeWidth={2} />
          </motion.span>
        ))}
      </div>
      <span className="text-[13px] font-semibold tabular-nums text-brand">Team of {steps[k]}</span>
    </div>
  );
}

const visuals: ReactNode[] = [<Sliders />, <Checklist />, <DedicatedFit />, <Dial />, <Timeline />, <Scale />];
const spans = ['', '', 'md:row-span-2', '', 'md:col-span-2', ''];

function Tile({ i }: { i: number }) {
  const it = why.items[i];
  const tall = i === 2;
  return (
    <motion.article initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, ease: EASE, delay: (i % 4) * 0.07 }}
      className={cn('group relative flex flex-col rounded-[2rem] border border-line bg-white p-3 shadow-soft transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lift', spans[i])}>
      <GlowingEffect spread={36} proximity={56} borderWidth={1.5} />
      <div className={cn('relative grid place-items-center overflow-hidden rounded-[1.5rem] bg-ice px-6', tall ? 'min-h-[440px] flex-1 md:min-h-[300px]' : 'h-[200px]')}>{visuals[i]}</div>
      <div className="px-4 pb-4 pt-6">
        <h3 className="font-display text-[23px] font-semibold leading-tight tracking-[-0.03em] text-ink">{it.title}</h3>
        <p className="mt-2.5 text-[15.5px] leading-relaxed text-muted">{it.body}</p>
      </div>
    </motion.article>
  );
}

export default function Why() {
  return (
    <section id="why" data-theme="light" className="section bg-white">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
          <SectionHeader align="left" tag={why.eyebrow} title={why.title} highlight={['Choose']} />
          <Reveal delay={0.1}>
            <p className="text-[17px] leading-[1.75] text-muted">{why.intro}</p>
            <p className="mt-5 flex items-center gap-3 font-display text-[19px] font-semibold tracking-[-0.02em] text-ink"><span className="h-px w-8 bg-brand" />{why.closer}</p>
          </Reveal>
        </div>
        <BentoGrid className="mt-16 auto-rows-auto">
          {why.items.map((_, i) => <Tile key={i} i={i} />)}
        </BentoGrid>
      </div>
    </section>
  );
}
