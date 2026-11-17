/**
 * Industries — "hover-reveal index". An editorial list; hovering (or focusing) a row sweeps it blue and
 * a glossy preview tile with the ref5 rotating-ring icon follows the cursor. Mobile: tap expands inline.
 */
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { HeartPulse, HandHeart, GraduationCap, Cpu, LineChart, Cog, Truck, Building2, ArrowRight, type LucideIcon } from 'lucide-react';
import { industries } from '@/data/content';
import { EASE, Reveal, SectionHeader } from '@/components/ui';
import { useMedia } from '@/hooks/useMedia';
import { cn } from '@/lib/utils';

const icons: LucideIcon[] = [HeartPulse, HandHeart, GraduationCap, Cpu, LineChart, Cog, Truck, Building2];
const SECTOR = 'Recruitment sector';

/** ref5 ring icon: glossy orb inside two counter-rotating arc rings. */
function RingIcon({ icon: Icon, size = 120 }: { icon: LucideIcon; size?: number }) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 h-full w-full animate-[spin-slow_14s_linear_infinite]" viewBox="0 0 120 120" aria-hidden>
        {[-125, 55].map((r) => <circle key={r} cx="60" cy="60" r="56" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="4" strokeDasharray="70 106" strokeLinecap="round" transform={`rotate(${r} 60 60)`} />)}
      </svg>
      <svg className="absolute inset-[11%] h-[78%] w-[78%] animate-[spin-slow_10s_linear_infinite_reverse]" viewBox="0 0 96 96" aria-hidden>
        {[-20, 160].map((r) => <circle key={r} cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" strokeDasharray="40 98" strokeLinecap="round" transform={`rotate(${r} 48 48)`} />)}
      </svg>
      <span className="relative grid place-items-center rounded-full bg-[radial-gradient(circle_at_32%_28%,#FFFFFF_0%,#DCEBFF_45%,#9CC8FF_100%)] text-brand shadow-[0_14px_30px_-8px_rgba(1,21,45,.5),inset_0_2px_6px_rgba(255,255,255,.8)]" style={{ width: size * 0.52, height: size * 0.52 }}>
        <Icon style={{ width: size * 0.22, height: size * 0.22 }} strokeWidth={1.7} />
      </span>
    </div>
  );
}

function Tile({ i, className, ring = 120 }: { i: number; className?: string; ring?: number }) {
  return (
    <div className={cn('relative grid place-items-center overflow-hidden bg-[radial-gradient(120%_100%_at_20%_0%,#5AA5FF_0%,#0361DB_45%,#01306F_100%)]', className)}>
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,.28)_0%,transparent_40%)]" />
      <RingIcon icon={icons[i]} size={ring} />
    </div>
  );
}

// Cursor preview: small and offset to the right of the cursor (and of the industry name) so it never
// covers the text. Client round 1: the old 280×200 tile was too big.
const PW = 150, PH = 110, GAP = 24;

export default function Industries() {
  const desktop = useMedia('(min-width: 1024px) and (hover: hover)');
  const list = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 170, damping: 26, mass: 0.7 }), sy = useSpring(y, { stiffness: 170, damping: 26, mass: 0.7 });

  /** Place the preview GAP px right of `px` (never left of the row's name), vertically centred on `py`,
   *  clamped inside the list. Coordinates are relative to the list. */
  const place = (px: number, py: number, row: Element | null) => {
    const r = list.current!.getBoundingClientRect();
    const name = row?.querySelector('[data-name]')?.getBoundingClientRect();
    const sector = row?.querySelector('[data-sector]')?.getBoundingClientRect();
    const left = Math.max(px, name ? name.right - r.left : 0) + GAP;
    const maxLeft = sector && sector.width ? sector.left - r.left - GAP - PW : r.width - PW; // stay clear of the right-hand label
    x.set(Math.min(left, maxLeft)); y.set(Math.min(Math.max(py - PH / 2, 0), r.height - PH));
  };
  const follow = (e: React.PointerEvent) => {
    const r = list.current!.getBoundingClientRect();
    place(e.clientX - r.left, e.clientY - r.top, (e.target as Element).closest('button'));
  };
  // keyboard focus: park the preview just after the row's name
  const anchor = (el: HTMLElement) => {
    const r = list.current!.getBoundingClientRect(), b = el.getBoundingClientRect();
    place(0, b.top - r.top + b.height / 2, el);
  };

  return (
    <section id="industries" data-theme="light" className="section bg-white">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
          <SectionHeader align="left" tag={industries.eyebrow} title={industries.title} highlight={['Diverse']} />
          <Reveal delay={0.1}>
            <p className="text-[17px] leading-[1.75] text-muted">{industries.intro}</p>
            <p className="mt-4 text-[17px] font-medium text-ink">{industries.sub}</p>
          </Reveal>
        </div>

        <ul ref={list} className="relative mt-16 border-t border-navy/10" onPointerMove={desktop ? follow : undefined} onPointerLeave={() => setActive(null)}>
          {industries.items.map((name, i) => {
            const on = desktop ? active === i : open === i;
            const Icon = icons[i];
            return (
              <motion.li key={name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8, ease: EASE, delay: (i % 4) * 0.05 }}
                className="border-b border-navy/10">
                <button type="button" aria-expanded={desktop ? undefined : on}
                  onPointerEnter={() => desktop && setActive(i)}
                  onFocus={(e) => { if (desktop) { setActive(i); anchor(e.currentTarget); } }}
                  onBlur={() => desktop && setActive(null)}
                  onClick={() => !desktop && setOpen(on ? null : i)}
                  className="group relative isolate flex w-full items-center gap-4 overflow-hidden rounded-2xl px-3 py-5 text-left outline-none sm:gap-6 sm:px-5 lg:py-6">
                  <span aria-hidden className={cn('absolute inset-0 -z-10 origin-left rounded-2xl bg-grad transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]', on && desktop ? 'scale-x-100' : 'scale-x-0')} />
                  <span className={cn('w-8 shrink-0 text-[14px] font-semibold tabular-nums transition-colors duration-300', on && desktop ? 'text-white/70' : 'text-muted')}>0{i + 1}</span>
                  <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ice text-brand lg:hidden', on && 'bg-brand text-white')}><Icon className="h-5 w-5" strokeWidth={1.6} /></span>
                  <span data-name className={cn('font-display text-[clamp(1.75rem,4.6vw,4rem)] font-semibold leading-none tracking-[-0.045em] transition-colors duration-300', on && desktop ? 'text-white' : 'text-ink')}>{name}</span>
                  <span aria-hidden className={cn('mx-2 hidden h-px flex-1 translate-y-3 border-b-2 border-dotted transition-colors duration-300 lg:block', on && desktop ? 'border-white/40' : 'border-navy/15')} />
                  <span data-sector className={cn('ml-auto hidden whitespace-nowrap text-[15px] font-medium transition-colors duration-300 sm:block lg:ml-0', on && desktop ? 'text-white/85' : 'text-muted')}>{SECTOR}</span>
                  <ArrowRight className={cn('ml-auto h-6 w-6 shrink-0 transition-all duration-500 sm:ml-0', on ? '-rotate-45' : '', on && desktop ? 'text-white' : 'text-brand')} strokeWidth={1.8} />
                </button>
                {!desktop && (
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
                        <Tile i={i} ring={96} className="mb-5 h-[160px] rounded-[1.25rem]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.li>
            );
          })}

          {/* cursor-following preview (desktop) */}
          {desktop && (
            <motion.div aria-hidden className="pointer-events-none absolute left-0 top-0 z-10" style={{ x: sx, y: sy, width: PW, height: PH }}
              initial={false} animate={{ opacity: active === null ? 0 : 1, scale: active === null ? 0.9 : 1 }} transition={{ duration: 0.15, ease: EASE }}>
              <AnimatePresence initial={false}>
                {active !== null && (
                  <motion.div key={active} className="absolute inset-0" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Tile i={active} ring={76} className="h-full w-full rounded-[18px] shadow-[0_14px_30px_-12px_rgba(3,97,219,.45)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </ul>
      </div>
    </section>
  );
}
