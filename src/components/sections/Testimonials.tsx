/** Testimonials — "editorial quote". One large quote at a time (words blur in), role tabs with progress,
 *  auto-advance every 7s (paused on hover/focus, off with reduced motion), client values as a marquee. */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Quote } from 'lucide-react';
import { testimonials as t } from '@/data/content';
import { Reveal, SplitHeading, Tag } from '@/components/ui';
import { Marquee } from '@/components/magicui';
import { TextGenerateEffect } from '@/components/aceternity';
import { prefersReducedMotion } from '@/lib/scroll';
import { cn } from '@/lib/utils';

const DURATION = 7000;
// max-width in ch must live on the element that carries the quote's font size
const quoteCls = 'mx-auto max-w-[28ch] font-display text-[clamp(1.75rem,3vw,2.6rem)] font-medium leading-[1.25] tracking-[-0.03em] text-ink';

export default function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const auto = !prefersReducedMotion();

  useEffect(() => {
    if (!auto || paused) return;
    const id = setTimeout(() => setI((v) => (v + 1) % t.items.length), DURATION);
    return () => clearTimeout(id);
  }, [i, paused, auto]);

  return (
    <section id="testimonials" data-theme="light" className="section bg-white">
      <div className="container-site">
        <div className="flex flex-col items-center gap-6 text-center">
          <Reveal y={12}><Tag>{t.eyebrow}</Tag></Reveal>
          <SplitHeading text={t.title} highlight={['Partnership']} className="h-section mx-auto max-w-[18ch] text-ink" />
          <Reveal delay={0.1}><p className="font-display text-[20px] font-medium tracking-[-0.02em] text-navy">{t.lead}</p></Reveal>
        </div>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-[880px] gap-12 text-[16px] leading-[1.75] text-muted md:columns-2">{t.body}</p>
        </Reveal>

        <Reveal className="mt-20">
          <figure className="mx-auto flex max-w-[980px] flex-col items-center text-center" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
            <span className="grid h-14 w-14 place-items-center rounded-full bg-grad text-white shadow-blue"><Quote className="h-6 w-6" strokeWidth={1.8} /></span>
            {/* every quote sits in the same cell; the inactive ones are invisible so the height never jumps */}
            <blockquote className="mt-8 grid w-full" aria-live="polite">
              {t.items.map((q, k) => (
                <div key={k} className={cn('col-start-1 row-start-1 self-center', k !== i && 'invisible')} aria-hidden={k !== i}>
                  {k === i ? <TextGenerateEffect key={i} words={`“${q.quote}”`} className={quoteCls} duration={0.6} /> : <p className={quoteCls}>“{q.quote}”</p>}
                </div>
              ))}
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3 text-[16px]">
              <span className="hidden h-px w-8 bg-brand sm:block" />
              <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <b className="font-semibold text-ink">{t.items[i].role}</b> <span className="text-muted">· {t.items[i].org}</span>
              </motion.span>
            </figcaption>

            <div className="mt-10 grid w-full max-w-[640px] grid-cols-3 gap-3" role="tablist" aria-label="Client testimonials">
              {t.items.map((q, k) => (
                <button key={k} role="tab" aria-selected={k === i} onClick={() => setI(k)}
                  className="group flex flex-col gap-2.5 rounded-xl px-1 py-2 text-left">
                  <span className="relative h-[3px] overflow-hidden rounded-full bg-navy/10">
                    {k === i && (
                      <motion.span key={`${i}-${paused}`} className="absolute inset-y-0 left-0 rounded-full bg-grad"
                        initial={{ width: auto && !paused ? '0%' : '100%' }} animate={{ width: '100%' }} transition={{ duration: auto && !paused ? DURATION / 1000 : 0, ease: 'linear' }} />
                    )}
                    {k < i && <span className="absolute inset-0 rounded-full bg-brand/40" />}
                  </span>
                  <span className={cn('text-[14px] font-medium transition-colors', k === i ? 'text-ink' : 'text-muted group-hover:text-ink')}>{q.role}</span>
                </button>
              ))}
            </div>
          </figure>
        </Reveal>

        <div className="mt-24 text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand">{t.valuesTitle}</p>
        </div>
      </div>
      <div className="mt-8 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <Marquee duration={45} gap={14}>
          {t.values.map((v) => (
            <span key={v} className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-ice/60 px-5 py-3 text-[16px] font-medium text-ink">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-white"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>{v}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
