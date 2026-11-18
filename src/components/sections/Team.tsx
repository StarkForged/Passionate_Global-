/** Team — reference: ref7 / ref8 ("Personal profile" slide with gradient quote card + profile row). */
import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { Plus, Quote, X } from 'lucide-react';
import { team } from '@/data/content';
import { EASE, Reveal, SectionHeader } from '@/components/ui';
import sizes from '@/data/images.json';

const dims = (src: string) => (sizes as Record<string, number[]>)[src] ?? [];

/** 3D glass logo watermark (glass variant = light backgrounds only). */
const WATERMARK = { src: 'img/brand/logo-3d-glass-600.webp', srcSet: 'img/brand/logo-3d-glass-256.webp 256w, img/brand/logo-3d-glass-600.webp 600w, img/brand/logo-3d-glass-1200.webp 1200w' };

/** Portrait backdrop ("editorial panel", client's pick from options A/B/C, Nov 2026): pale-blue diagonal gradient,
 *  the 3D glass logo large and cropped off the bottom-right edge (quiet, 24%), one soft white light streak. */
function Backdrop({ big }: { big?: boolean }) {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(150deg,#DCE8F7_0%,#EDF3FB_48%,#FFFFFF_100%)]" />
      <img src={WATERMARK.src} srcSet={WATERMARK.srcSet} sizes={big ? '420px' : '(min-width: 768px) 32vw, 95vw'} alt="" aria-hidden width={600} height={582} loading="lazy" decoding="async"
        className="pointer-events-none absolute -bottom-[18%] -right-[34%] w-full -rotate-[8deg] select-none opacity-[.24] transition-transform duration-[1.2s] ease-out [filter:saturate(.8)] group-hover:-rotate-[12deg] group-hover:scale-[1.03]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_38%,rgba(255,255,255,.6)_50%,transparent_62%)]" />
    </>
  );
}

/** Portrait (round 5, client: "the main focus should be the photo, the logo in the background").
 *  Light editorial backdrop with the 3D glass logo quiet behind the person (hover: a further -4deg, 1.03); the transparent cut-out
 *  stands at 82% of the frame height, bottom-anchored and centred, so there is air around the head and shoulders.
 *  Cut-outs come from scripts/optimise-images.py, all framed identically (4:4.6, eyes at 35%), so every person sits
 *  at the same scale. No photo -> monogram on the same backdrop. `sizes` = the rendered width for srcset. */
export function Portrait({ initials, photo, name, className, big, sizes: sz }: { initials: string; photo?: string; name: string; className?: string; big?: boolean; pos?: string; sizes: string }) {
  const [w, h] = photo ? dims(photo) : [];
  const small = photo?.replace(/\.webp$/, '-480.webp');
  const srcSet = photo && small && dims(small).length ? `${small} 480w, ${photo} ${w}w` : undefined;
  return (
    <div className={clsx('isolate overflow-hidden', className)}>
      <Backdrop big={big} />
      {photo ? (
        <img src={photo} srcSet={srcSet} sizes={sz} alt={`Portrait of ${name}`} width={w} height={h} loading="lazy" decoding="async"
          className="absolute bottom-0 left-1/2 h-[82%] w-auto max-w-none -translate-x-1/2 [filter:drop-shadow(0_20px_28px_rgba(1,21,45,.16))]" />
      ) : (
        <span className={clsx('absolute inset-0 grid place-items-center font-display font-light leading-none tracking-[-0.06em] text-navy/80', big ? 'text-[clamp(6rem,11vw,9rem)]' : 'text-[clamp(4.5rem,7vw,6rem)]')}>{initials}</span>
      )}
      {/* faint rim light along the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
    </div>
  );
}

/** Tenure as a small light pill (off the photo, round 5). */
const Pill = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex h-7 shrink-0 items-center rounded-full bg-ice px-3 text-[12px] font-semibold text-brand ring-1 ring-brand/10">{children}</span>
);

function Member({ m, i }: { m: (typeof team.members)[number]; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.article initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
      className="group relative overflow-hidden rounded-[2rem] bg-white shadow-lift">
      <div className="relative aspect-square">
        <Portrait initials={m.initials} photo={m.photo} name={m.name} pos={m.photoPos} sizes="(min-width: 1280px) 300px, (min-width: 768px) 25vw, 75vw" className="absolute inset-0" />
        {/* bio overlay */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.6, ease: EASE }}
              className="absolute inset-0 overflow-y-auto bg-deep/95 p-6 text-white backdrop-blur-xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-sky">{m.role}</p>
              <h3 className="mt-1 font-display text-[22px] font-semibold tracking-[-0.03em]">{m.name}</h3>
              {m.bio.map((b, k) => <p key={k} className="mt-3 text-[14px] leading-relaxed text-[#B9CBE4]">{b}</p>)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-start justify-between gap-3 border-t border-navy/[0.06] px-6 pt-5">
        <div>
          <h3 className="font-display text-[24px] font-semibold leading-tight tracking-[-0.03em] text-navy">{m.name}</h3>
          <p className="mt-0.5 text-[15px] font-medium text-brand">{m.role}</p>
        </div>
        <Pill>{m.tenure}</Pill>
      </div>
      <div className="flex items-center justify-between gap-4 px-6 pb-6 pt-3">
        <p className="line-clamp-2 text-[14px] leading-relaxed text-muted">{m.bio[0]}</p>
        <button onClick={() => setOpen((o) => !o)} aria-label={open ? `Close ${m.name} bio` : `Read ${m.name} bio`} aria-expanded={open}
          className={clsx('grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all duration-300', open ? 'bg-navy text-white' : 'bg-ice text-brand hover:bg-brand hover:text-white')}>
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>
    </motion.article>
  );
}

export default function Team() {
  const f = team.founder;
  return (
    <section id="team" data-theme="light" className="section bg-gradient-to-b from-white to-ice">
      <div className="container-site">
        <SectionHeader tag={team.eyebrow} title={team.title} highlight={['offshore']} />

        <Reveal className="mt-16">
          <article className="grid overflow-hidden rounded-[2.5rem] bg-white shadow-lift lg:grid-cols-[440px_1fr]">
            <div className="group flex flex-col p-3 sm:p-4 lg:border-r lg:border-navy/[0.06]">
              <div className="relative aspect-square overflow-hidden rounded-[2rem] ring-1 ring-navy/[0.05]">
                <Portrait big initials={f.initials} photo={f.photo} name={f.name} pos={f.photoPos} sizes="(min-width: 1024px) 330px, 75vw" className="absolute inset-0" />
              </div>
              <div className="px-4 pb-5 pt-6 sm:px-5">
                <Pill>{f.tenure} experience</Pill>
                <h3 className="mt-3 font-display text-[clamp(1.75rem,2.6vw,2.25rem)] font-semibold leading-none tracking-[-0.04em] text-navy">{f.name}</h3>
                <p className="mt-2 text-[15px] font-medium text-brand">{f.role}</p>
              </div>
            </div>
            <div className="flex flex-col p-8 sm:p-12">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">Founder’s story</p>
              <div className="mt-5 space-y-4 text-[16px] leading-[1.75] text-muted">
                {f.bio.map((b, i) => <p key={i}>{b}</p>)}
              </div>
              <figure className="relative mt-8 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#1679E0_0%,#0361DB_45%,#01152D_100%)] p-8 text-white">
                <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-sky/40 blur-3xl" />
                <Quote className="h-9 w-9 text-sky" strokeWidth={1.5} />
                <blockquote className="relative mt-4 font-display text-[clamp(1.25rem,2vw,1.6rem)] font-medium leading-[1.35] tracking-[-0.02em]">{f.quote}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 text-[14px] text-[#BFDCFF]"><span className="h-px w-8 bg-sky" />{f.name}, {f.role}</figcaption>
              </figure>
            </div>
          </article>
        </Reveal>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {team.members.map((m, i) => <Member key={m.name} m={m} i={i} />)}
        </div>
      </div>
    </section>
  );
}
