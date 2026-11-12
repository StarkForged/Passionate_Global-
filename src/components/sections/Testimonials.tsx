/** Testimonials — reference: ref8 ("Three people join" gradient / dark cards) → swipeable card stack. */
import { useEffect, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import clsx from 'clsx';
import { Check, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials as T } from '@/data/content';
import { EASE, Reveal, SectionHeader } from '@/components/ui';

export default function Testimonials() {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = T.items.length;
  const go = (d: number) => setCur((c) => (c + d + n) % n);
  useEffect(() => { if (paused) return; const id = setTimeout(() => go(1), 6500); return () => clearTimeout(id); }, [cur, paused]);
  const onDragEnd = (_: unknown, info: PanInfo) => { if (Math.abs(info.offset.x) > 80) go(info.offset.x < 0 ? 1 : -1); };

  return (
    <section id="testimonials" data-theme="light" className="section overflow-hidden bg-white">
      <div className="container-site grid items-center gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <SectionHeader align="left" tag={T.eyebrow} title={T.title} highlight={['Partnership']} />
          <Reveal delay={0.1} className="mt-6 space-y-4">
            <p className="font-display text-[20px] font-medium tracking-[-0.02em] text-navy">{T.lead}</p>
            <p className="text-[16px] leading-[1.75] text-muted">{T.body}</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-10 rounded-3xl border border-line bg-ice p-6">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">{T.valuesTitle}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {T.values.map((v, i) => (
                <motion.li key={v} className="flex items-center gap-3 text-[15px] font-medium text-ink"
                  initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: EASE }}>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-grad text-white shadow-blue"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>{v}
                </motion.li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
          <div className="relative h-[440px] sm:h-[420px]">
            {T.items.map((t, i) => {
              const pos = (i - cur + n) % n;
              return (
                <motion.figure key={i}
                  drag={pos === 0 ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6} onDragEnd={onDragEnd}
                  animate={{ y: pos * 26, scale: 1 - pos * 0.055, opacity: pos === 0 ? 1 : pos === 1 ? 0.75 : 0.45, rotate: pos === 0 ? 0 : pos === 1 ? 2 : -2 }}
                  transition={{ duration: 0.7, ease: EASE }}
                  style={{ zIndex: n - pos }}
                  className={clsx('absolute inset-x-0 top-0 flex min-h-[360px] cursor-grab flex-col rounded-[2rem] p-9 active:cursor-grabbing sm:p-11',
                    pos === 0 ? 'bg-[linear-gradient(140deg,#1679E0_0%,#0361DB_50%,#0240A0_100%)] text-white shadow-[0_40px_80px_-30px_rgba(3,97,219,.7)]' : pos === 1 ? 'bg-navy text-white' : 'border border-line bg-white text-ink')}>
                  <Quote className={clsx('h-11 w-11', pos === 0 ? 'text-white/40' : 'text-sky')} strokeWidth={1.4} />
                  <blockquote className="mt-6 font-display text-[clamp(1.3rem,2.1vw,1.7rem)] font-medium leading-[1.38] tracking-[-0.02em]">{t.quote}</blockquote>
                  <figcaption className="mt-auto flex items-center gap-4 pt-8">
                    <span className={clsx('grid h-12 w-12 place-items-center rounded-full font-display text-[15px] font-semibold', pos === 0 ? 'bg-white/15' : 'bg-white/10')}>{t.role.split(' ').map((w) => w[0]).join('')}</span>
                    <span>
                      <b className="block font-semibold">{t.role}</b>
                      <span className={clsx('text-[14px]', pos === 0 ? 'text-white/75' : 'text-[#9FB3CF]')}>{t.org}</span>
                    </span>
                  </figcaption>
                </motion.figure>
              );
            })}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <button onClick={() => go(-1)} aria-label="Previous testimonial" className="grid h-12 w-12 place-items-center rounded-full border border-line bg-white shadow-soft transition hover:bg-navy hover:text-white"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => go(1)} aria-label="Next testimonial" className="grid h-12 w-12 place-items-center rounded-full border border-line bg-white shadow-soft transition hover:bg-navy hover:text-white"><ChevronRight className="h-5 w-5" /></button>
            <div className="ml-2 flex gap-2">
              {T.items.map((_, i) => <button key={i} onClick={() => setCur(i)} aria-label={`Testimonial ${i + 1}`} className={clsx('h-2 rounded-full transition-all duration-500', i === cur ? 'w-8 bg-brand' : 'w-2 bg-navy/20')} />)}
            </div>
            <span className="ml-auto text-[13px] font-medium tabular-nums text-muted">0{cur + 1} / 0{n}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
