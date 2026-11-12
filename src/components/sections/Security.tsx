/** IT Infrastructure & Security — "animated beam hub" (ref5 bottom "data centre" hub, done in 2D). */
import { forwardRef, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, ServerCog, Cpu, Wifi, Globe2, RefreshCw, ShieldCheck, type LucideIcon } from 'lucide-react';
import { security } from '@/data/content';
import { EASE, Reveal, SectionHeader } from '@/components/ui';
import { AnimatedBeam, BorderBeam, DotPattern } from '@/components/magicui';

const icons: LucideIcon[] = [Lock, ServerCog, Cpu, Wifi, Globe2, RefreshCw];

const Node = forwardRef<HTMLDivElement, { i: number }>(({ i }, ref) => {
  const Icon = icons[i];
  return (
    <div className="flex w-[64px] flex-col items-center gap-3 sm:w-[132px]">
      <div ref={ref} className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-[#0A2547] text-[#CFE3FF] shadow-[0_0_0_6px_rgba(90,165,255,.06),inset_0_1px_0_rgba(255,255,255,.18)] sm:h-16 sm:w-16">
        <Icon className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={1.6} />
      </div>
      <span className="hidden text-center text-[13px] font-medium leading-snug text-[#B9CBE4] sm:block">{security.items[i].title}</span>
    </div>
  );
});
Node.displayName = 'Node';

function Hub() {
  const box = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const refs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const left = [0, 1, 2], right = [3, 4, 5];
  const curve = [-70, 0, 70];
  return (
    <div ref={box} className="relative mx-auto flex h-[340px] w-full max-w-[980px] items-center justify-between sm:h-[440px]" role="img" aria-label="Six security measures all feeding into the protection of your data">
      <div className="flex h-full flex-col justify-between py-2">{left.map((i) => <Node key={i} i={i} ref={refs[i]} />)}</div>
      <div ref={core} className="relative z-10 grid h-28 w-28 place-items-center rounded-[1.75rem] bg-white text-brand shadow-[0_0_0_10px_rgba(255,255,255,.06),0_0_80px_-10px_rgba(90,165,255,.7)] sm:h-40 sm:w-40 sm:rounded-[2rem]">
        <div className="flex flex-col items-center gap-2">
          <ShieldCheck className="h-10 w-10 sm:h-14 sm:w-14" strokeWidth={1.5} />
          <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink sm:text-[17px]">Your data</span>
        </div>
      </div>
      <div className="flex h-full flex-col justify-between py-2">{right.map((i) => <Node key={i} i={i} ref={refs[i]} />)}</div>
      {left.map((i, k) => <AnimatedBeam key={i} containerRef={box} fromRef={refs[i]} toRef={core} curvature={curve[k]} duration={4.5} delay={k * 0.5} />)}
      {right.map((i, k) => <AnimatedBeam key={i} containerRef={box} fromRef={refs[i]} toRef={core} curvature={curve[k]} duration={4.5} delay={0.25 + k * 0.5} reverse />)}
    </div>
  );
}

export default function Security() {
  return (
    <section id="security" data-theme="dark" className="section relative overflow-hidden bg-navy text-white">
      <DotPattern className="text-sky/[0.12] [mask-image:radial-gradient(60%_50%_at_50%_45%,#000,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]" />
      <div className="container-site relative">
        <SectionHeader dark tag={security.eyebrow} title={security.title} intro={security.intro} highlight={['Peace']} className="[&_h2]:max-w-[20ch]" />

        <Reveal className="mt-16"><Hub /></Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {security.items.map((it, i) => {
            const Icon = icons[i];
            return (
              <motion.article key={it.title} tabIndex={0} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: EASE, delay: (i % 3) * 0.08 }}
                className="group relative rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-7 outline-none transition-colors duration-500 hover:bg-white/[0.05] focus-visible:bg-white/[0.05]">
                <span className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <BorderBeam size={120} duration={7} colorFrom="#BFE0FF" colorTo="#1679E0" />
                </span>
                <Icon className="h-7 w-7 text-sky" strokeWidth={1.6} />
                <h3 className="mt-5 font-display text-[21px] font-semibold tracking-[-0.025em] text-white">{it.title}</h3>
                <p className="mt-2.5 text-[16px] leading-[1.7] text-[#B9CBE4]">{it.body}</p>
              </motion.article>
            );
          })}
        </div>

        <Reveal className="mt-14"><p className="mx-auto max-w-[62ch] text-center text-[17px] leading-[1.75] text-[#B9CBE4]">{security.outro}</p></Reveal>
      </div>
    </section>
  );
}
