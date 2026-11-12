/** Why choose us — reference: ref6 (notched cards, one highlighted with the gradient). */
import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Crosshair, Rocket, Users, Gem, Handshake, TrendingUp, ArrowUpRight } from 'lucide-react';
import { why } from '@/data/content';
import { EASE, Reveal, SplitHeading, Tag } from '@/components/ui';

const icons = [Crosshair, Rocket, Users, Gem, Handshake, TrendingUp];
const NOTCH = 'polygon(0 0, calc(100% - 44px) 0, 100% 44px, 100% 100%, 44px 100%, 0 calc(100% - 44px))';

export default function Why() {
  const [active, setActive] = useState(0);
  return (
    <section id="why" data-theme="light" className="section bg-white">
      <div className="container-site">
        <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div className="flex flex-col items-start gap-6">
            <Reveal y={12}><Tag>{why.eyebrow}</Tag></Reveal>
            <SplitHeading text={why.title} className="h-section max-w-[14ch] text-ink" highlight={['Choose']} />
          </div>
          <Reveal delay={0.1}>
            <p className="lead">{why.intro}</p>
            <p className="mt-5 flex items-center gap-3 font-display text-[19px] font-semibold tracking-[-0.02em] text-navy"><span className="h-px w-10 bg-brand" />{why.closer}</p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {why.items.map((it, i) => {
            const Icon = icons[i];
            const on = active === i;
            return (
              <motion.article
                key={it.title}
                tabIndex={0}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: EASE, delay: (i % 3) * 0.08 }}
                className="relative h-full cursor-default outline-none"
              >
                <div className={clsx('relative flex h-full min-h-[340px] flex-col p-8 transition-[transform,box-shadow] duration-500', on ? '-translate-y-2' : '')} style={{ clipPath: NOTCH }}>
                  {/* background layers (crossfade) */}
                  <div className="absolute inset-0 bg-[#EAF1FB]" />
                  <div className={clsx('absolute inset-0 bg-[linear-gradient(150deg,#3D8FF5_0%,#0361DB_45%,#0240A0_100%)] transition-opacity duration-500', on ? 'opacity-100' : 'opacity-0')} />
                  <div className={clsx('absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/20 blur-3xl transition-opacity duration-500', on ? 'opacity-100' : 'opacity-0')} />

                  <div className="relative flex items-start justify-between">
                    <span className={clsx('grid h-12 w-12 place-items-center rounded-2xl transition-colors duration-500', on ? 'bg-white/15 text-white' : 'bg-white text-brand shadow-soft')}>
                      <Icon className="h-[22px] w-[22px]" strokeWidth={1.7} />
                    </span>
                    <span className={clsx('mr-6 font-display text-[13px] font-semibold tabular-nums transition-colors duration-500', on ? 'text-white/70' : 'text-brand/50')}>0{i + 1} / 06</span>
                  </div>

                  <h3 className={clsx('relative mt-auto pt-16 font-display text-[clamp(1.6rem,2.2vw,2rem)] font-semibold leading-[1.05] tracking-[-0.035em] transition-colors duration-500', on ? 'text-white' : 'text-brand')}>{it.title}</h3>
                  <p className={clsx('relative mt-4 max-w-[38ch] text-[15px] leading-relaxed transition-colors duration-500', on ? 'text-white/85' : 'text-muted')}>{it.body}</p>
                </div>
                <span className={clsx('pointer-events-none absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full transition-all duration-500', on ? 'scale-100 bg-grad text-white opacity-100 shadow-blue' : 'scale-75 opacity-0')}>
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
