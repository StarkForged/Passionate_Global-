/** Hero — reference: ref_vid1 / ref_vid2. One planet, one headline, two buttons. */
import { lazy, Suspense, useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { hero, trust } from '@/data/content';
import { Button, EASE } from '@/components/ui';
import { BorderBeam, Marquee } from '@/components/magicui';
import { gsap, prefersReducedMotion } from '@/lib/scroll';

const Globe = lazy(() => import('@/components/three/Globe'));

function Words({ text, delay, className }: { text: string; delay: number; className?: string }) {
  const words = text.split(' ');
  return (
    <span className="block" aria-hidden>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-top">
          <motion.span className={`inline-block ${className ?? ''}`} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.07 }}>
            {w}{i < words.length - 1 && ' '}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const bloom = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  // Scroll-scrubbed exit: planet rises + scales (inside Globe via `progress`), copy lifts away,
  // the horizon glow brightens so the light carries into the (light) About section.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => (progress.current = s.progress) } })
        .to(content.current, { yPercent: -35, opacity: 0, ease: 'none', duration: 0.6 }, 0)
        .to(trustRef.current, { opacity: 0, ease: 'none', duration: 0.3 }, 0)
        .to(scrim.current, { opacity: 0, ease: 'none', duration: 0.35 }, 0.05)
        .fromTo(bloom.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.3 }, 0.05)
        .fromTo(glow.current, { opacity: 0 }, { opacity: 1, ease: 'power1.in', duration: 0.4 }, 0.22)
        .set({}, {}, 1); // timeline spans exactly 0..1 of the scroll
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="home" data-theme="dark" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-deep text-white lg:min-h-[max(100svh,820px)]">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(120%_70%_at_50%_0%,#052149_0%,#01122B_42%,#000915_75%)]" />
      <div className="absolute inset-0 -z-10">
        <Suspense fallback={null}><Globe progress={progress} /></Suspense>
      </div>
      {/* bottom scrim keeps the trust marquee legible over the planet */}
      <div ref={scrim} className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent via-deep/70 to-deep/90" />
      {/* horizon glow that brightens on scroll and hands over to the light About section */}
      <div ref={bloom} className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[50%] opacity-0"
        style={{ background: 'radial-gradient(75% 85% at 50% 100%, rgba(60,140,255,.55), rgba(30,100,230,.22) 50%, transparent 78%)' }} />
      <div ref={glow} className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[40%] opacity-0"
        style={{ background: 'linear-gradient(to top, #FFFFFF 0%, #EAF3FF 8%, rgba(160,205,255,.6) 24%, transparent 60%)' }} />

      <div ref={content} className="container-site relative flex flex-col items-center pt-[clamp(8rem,17vh,11rem)] text-center">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
          className="mb-5 max-w-[46ch] text-balance text-[15px] font-medium tracking-[-0.005em] text-[#8DB8EE] sm:text-[16px]">
          {hero.kicker}
        </motion.p>

        <h1 className="font-display text-[clamp(2.75rem,min(8vw,12.5vh),7rem)] font-semibold leading-[0.96] tracking-[-0.045em]" aria-label={hero.title.join(' ')}>
          <Words text={hero.title[0]} delay={0.45} />
          <Words text={hero.title[1]} delay={0.68} className="text-grad-light" />
        </h1>

        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 1 }}
          className="mt-6 max-w-[40ch] text-balance text-[17px] leading-relaxed text-[#B6C8E2] sm:text-[18px]">
          {hero.badge}.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 1.15 }}
          className="mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <span className="relative inline-flex rounded-full">
            <Button href="#contact" className="w-full sm:w-auto">{hero.primary}</Button>
            <BorderBeam size={70} duration={6} borderWidth={1.5} colorFrom="#FFFFFF" colorTo="#9CCBFF" />
          </span>
          <Button href="#services" variant="glass" arrow={false}>{hero.secondary}</Button>
        </motion.div>
      </div>

      {/* trust marquee */}
      <div ref={trustRef} className="absolute inset-x-0 bottom-0 pb-6 sm:pb-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1.5 }}>
        <p className="mb-3.5 px-5 text-center text-[13px] font-semibold uppercase tracking-[0.16em] text-[#7FA3D1]">{trust.title}</p>
        <div className="mx-auto max-w-site opacity-[.55] transition-opacity duration-500 [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)] hover:opacity-100">
          <Marquee duration={36} gap={0}>
            {trust.items.map((t) => (
              <span key={t} className="flex items-center whitespace-nowrap px-8 font-display text-[16px] font-medium tracking-[-0.01em] text-[#E3EEFC] after:ml-16 after:h-4 after:w-px after:bg-white/25 sm:text-[17px]">
                {t}
              </span>
            ))}
          </Marquee>
        </div>
      </motion.div>
      </div>
    </section>
  );
}
