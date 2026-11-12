import { lazy, Suspense, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileSpreadsheet, MoonStar, UserCheck, ArrowRight, Users, Wallet, BadgeCheck, Briefcase } from 'lucide-react';
import { hero, trust } from '@/data/content';
import { Button, EASE } from '@/components/ui';
import { useClock } from '@/hooks/useClock';
import { scrollToHash } from '@/lib/scroll';

const Globe = lazy(() => import('@/components/three/Globe'));

const trustIcons = [Users, Wallet, ShieldCheck, MoonStar, Briefcase];

function Chip({ className, delay, children }: { className: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.1, ease: EASE, delay }}
      className={`absolute hidden lg:block ${className}`}
    >
      <div className="glass-dark animate-[float-y_7s_ease-in-out_infinite] rounded-2xl p-3 pr-4 shadow-[0_30px_60px_-25px_rgba(0,0,0,.8)]" style={{ animationDelay: `${-delay * 2}s` }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const scrollRef = useRef(0);
  const section = useRef<HTMLElement>(null);
  const london = useClock('Europe/London');

  useEffect(() => {
    const on = () => { const h = section.current?.offsetHeight || 1; scrollRef.current = Math.min(1, Math.max(0, scrollY / h)); };
    on(); addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  const words1 = hero.title[0].split(' '), words2 = hero.title[1].split(' ');

  return (
    <section ref={section} id="home" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-deep text-white lg:min-h-[max(100svh,820px)]">
      {/* background layers */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(120%_80%_at_50%_0%,#06264F_0%,#021534_38%,#000915_72%)]" />
      <div className="absolute inset-0 -z-10">
        <Suspense fallback={null}><Globe scrollRef={scrollRef} /></Suspense>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(42%_34%_at_50%_42%,rgba(0,9,21,.78),rgba(0,9,21,.35)_60%,transparent_85%)]" />

      <div className="container-site relative flex flex-1 flex-col items-center pt-36 text-center md:pt-40">
        <motion.a
          href="#services"
          onClick={(e) => { e.preventDefault(); scrollToHash('#services'); }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          className="group mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.05] py-1.5 pl-2 pr-4 text-[13px] font-medium text-[#CFE3FF] backdrop-blur-md transition hover:bg-white/10"
        >
          <span className="rounded-full bg-grad px-2.5 py-0.5 text-[11px] font-semibold text-white">New</span>
          {hero.badge}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </motion.a>

        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          className="mb-4 max-w-[60ch] text-[clamp(1.05rem,1.75vw,1.5rem)] font-normal tracking-[-0.02em] text-[#A9C4E8]">
          {hero.kicker}
        </motion.p>

        <h1 className="font-display text-[clamp(2.9rem,8vw,7.4rem)] font-semibold leading-[0.95] tracking-[-0.045em]" aria-label={hero.title.join(' ')}>
          <span className="block" aria-hidden>
            {words1.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top">
                <motion.span className="inline-block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.5 + i * 0.07 }}>{w}&nbsp;</motion.span>
              </span>
            ))}
          </span>
          <span className="block" aria-hidden>
            {words2.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top">
                <motion.span className="text-grad-light inline-block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.75 + i * 0.07 }}>{w}{i < words2.length - 1 ? ' ' : ''}</motion.span>
              </span>
            ))}
          </span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 1.05 }}
          className="mt-7 max-w-[62ch] text-[clamp(.95rem,1.15vw,1.08rem)] leading-relaxed text-[#B3C5DD]">
          {hero.body}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 1.2 }}
          className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href="#contact">{hero.primary}</Button>
          <Button href="#services" variant="glass" arrow={false}>{hero.secondary}</Button>
        </motion.div>
      </div>

      {/* floating activity cards */}
      <Chip className="left-[4%] top-[60%] xl:left-[6%]" delay={1.5}>
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300"><ShieldCheck className="h-[18px] w-[18px]" /></span>
          <div className="text-left">
            <p className="text-[13px] font-semibold">Compliance check</p>
            <p className="text-[11.5px] text-[#8FB0D8]">DBS · Right to work · References</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-52 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300" initial={{ width: '8%' }} animate={{ width: ['8%', '100%', '100%'] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.7, 1], ease: 'easeInOut', delay: 2 }} />
        </div>
      </Chip>
      <Chip className="right-[4%] top-[57%] xl:right-[6%]" delay={1.7}>
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky/15 text-sky"><FileSpreadsheet className="h-[18px] w-[18px]" /></span>
          <div className="text-left">
            <p className="text-[13px] font-semibold">Timesheets processed</p>
            <p className="text-[11.5px] text-[#8FB0D8]">Payroll ready for Friday</p>
          </div>
        </div>
        <div className="mt-3 flex h-10 items-end gap-1">
          {[40, 62, 48, 75, 58, 88, 70, 95, 80, 100].map((h, i) => (
            <motion.span key={i} className="w-[14px] rounded-[3px] bg-gradient-to-t from-brand to-sky" initial={{ height: 4 }} animate={{ height: `${h}%` }} transition={{ duration: 0.8, ease: EASE, delay: 2 + i * 0.06 }} />
          ))}
        </div>
      </Chip>
      <Chip className="left-[10%] top-[77%] xl:left-[13%]" delay={1.9}>
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-400/15 text-violet-300"><MoonStar className="h-[18px] w-[18px]" /></span>
          <div className="text-left">
            <p className="text-[13px] font-semibold">Night shift covered</p>
            <p className="text-[11.5px] text-[#8FB0D8]"><span className="tabular-nums text-white">{london}</span> London · Out-of-hours</p>
          </div>
        </div>
      </Chip>
      <Chip className="right-[10%] top-[76%] xl:right-[13%]" delay={2.1}>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {['#5AA5FF', '#1679E0', '#0361DB'].map((c, i) => (
              <span key={i} className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#0B2244] text-[10px] font-bold" style={{ background: c }}>{['JD', 'AK', 'SM'][i]}</span>
            ))}
          </div>
          <div className="text-left">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold">Candidates shortlisted <UserCheck className="h-3.5 w-3.5 text-emerald-300" /></p>
            <p className="text-[11.5px] text-[#8FB0D8]">Booked for interview</p>
          </div>
        </div>
      </Chip>

      {/* trust bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1.4 }} className="relative mt-16 border-t border-white/[0.07] bg-gradient-to-b from-transparent to-deep/80 pb-7 pt-6">
        <p className="mb-5 px-5 text-center text-[11.5px] font-semibold uppercase tracking-[0.18em] text-[#7F9CC2]">{trust.title}</p>
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex w-max animate-[marquee_34s_linear_infinite] gap-14 hover:[animation-play-state:paused]">
            {[...trust.items, ...trust.items, ...trust.items, ...trust.items].map((t, i) => {
              const Icon = trustIcons[i % trustIcons.length];
              return (
                <span key={i} className="flex items-center gap-3 whitespace-nowrap font-display text-[19px] font-medium tracking-[-0.01em] text-[#DCE9FA]">
                  <Icon className="h-5 w-5 text-sky" strokeWidth={1.7} />{t}<BadgeCheck className="ml-10 h-3 w-3 text-white/20" />
                </span>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
