/** Team — reference: ref7 / ref8 ("Personal profile" slide with gradient quote card + profile row). */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { Plus, Quote, X } from 'lucide-react';
import { team } from '@/data/content';
import { EASE, Reveal, SectionHeader } from '@/components/ui';

/** Portrait: shows the photo when provided, otherwise a branded monogram artwork. */
export function Portrait({ initials, photo, name, className, big }: { initials: string; photo?: string; name: string; className?: string; big?: boolean }) {
  return (
    <div className={clsx('isolate overflow-hidden', className)} style={{ background: 'radial-gradient(120% 100% at 25% 0%, #5AA5FF 0%, #0361DB 42%, #01152D 100%)' }}>
      {photo ? (
        <img src={photo} alt={name} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          {/* globe line artwork */}
          <svg className="absolute -bottom-[30%] -right-[25%] h-[110%] w-[110%] text-white/[0.09]" viewBox="0 0 200 200" aria-hidden>
            <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" />
            {[20, 45, 70].map((rx) => <ellipse key={rx} cx="100" cy="100" rx={rx} ry="96" fill="none" stroke="currentColor" />)}
            {[-60, -30, 0, 30, 60].map((y) => <ellipse key={y} cx="100" cy={100 + y} rx={Math.sqrt(96 * 96 - y * y)} ry={8} fill="none" stroke="currentColor" />)}
          </svg>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,9,21,.55))]" />
          <span className={clsx('absolute left-[8%] top-[6%] font-display font-light leading-none tracking-[-0.06em] text-white/95', big ? 'text-[clamp(6rem,11vw,10rem)]' : 'text-[clamp(4.5rem,7vw,6rem)]')}>{initials}</span>
        </>
      )}
    </div>
  );
}

function Member({ m, i }: { m: (typeof team.members)[number]; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.article initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
      className="group relative overflow-hidden rounded-[2rem] bg-white shadow-lift">
      <div className="relative aspect-[4/4.6]">
        <Portrait initials={m.initials} photo={m.photo} name={m.name} className="absolute inset-0 transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
        <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur-md">{m.tenure}</span>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <h3 className="font-display text-[26px] font-semibold tracking-[-0.03em]">{m.name}</h3>
          <p className="mt-0.5 text-[14px] font-medium text-[#BFDCFF]">{m.role}</p>
        </div>
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
      <div className="flex items-center justify-between gap-4 p-5">
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
            <div className="relative min-h-[420px]">
              <Portrait big initials={f.initials} photo={f.photo} name={f.name} className="absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-semibold backdrop-blur-md">{f.tenure} experience</span>
                <h3 className="mt-4 font-display text-[clamp(2rem,3.4vw,2.8rem)] font-semibold leading-none tracking-[-0.04em]">{f.name}</h3>
                <p className="mt-2 text-[15px] font-medium text-[#BFDCFF]">{f.role}</p>
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
