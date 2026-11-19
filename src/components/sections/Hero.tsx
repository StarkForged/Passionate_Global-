/** Hero — reference: ref_vid1 / ref_vid2. One planet, one headline, two buttons. */
import { Component, lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { hero, trust } from '@/data/content';
import { Button } from '@/components/ui';
import { BorderBeam, Marquee } from '@/components/magicui';
import { ensureScrollTrigger, gsap, onFirstIntent, prefersReducedMotion, scrollToHash } from '@/lib/scroll';

const Globe = lazy(() => import('@/components/three/Globe'));

/** WebGL API present, motion allowed and no Data Saver: otherwise the hero keeps the static poster. (No throwaway
 *  context: creating one costs as much as the real one. If context creation fails, GlBoundary keeps the poster.) */
function webglOk() {
  if (prefersReducedMotion()) return false;
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return false;
  return 'WebGLRenderingContext' in window;
}

class GlBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

/** CSS custom properties for the .intro-* animations (index.css): same timings as the original framer-motion intro. */
const v = ({ delay = 0, dur, rise }: { delay?: number; dur?: number; rise?: number }) =>
  ({ '--delay': `${delay}s`, ...(dur ? { '--dur': `${dur}s` } : {}), ...(rise ? { '--rise': `${rise}px` } : {}) }) as React.CSSProperties;

function Words({ text, delay, className }: { text: string; delay: number; className?: string }) {
  const words = text.split(' ');
  return (
    <span className="block" aria-hidden>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-top">
          <span className={`intro-word inline-block ${className ?? ''}`} style={v({ delay: delay + i * 0.07 })}>
            {w}{i < words.length - 1 && ' '}
          </span>
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
  // WebGL is client-only: not in the pre-rendered HTML. Launch 4: loaded when the main thread is idle after
  // hydration (the three.js chunk is ~240 kB gz), skipped without WebGL, with reduced motion or Data Saver.
  // Until it is ready a static CSS planet (the poster below) holds the same place.
  const [gl, setGl] = useState(false);
  const [glReady, setGlReady] = useState(false);
  useEffect(() => {
    if (!webglOk()) return;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cic = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => setGl(true), { timeout: 3000 });
    return () => cic(id);
  }, []);

  // Scroll-scrubbed exit: planet rises + scales (inside Globe via `progress`), copy lifts away,
  // the horizon glow brightens so the light carries into the (light) About section.
  // Launch 4: built on the first scroll intent (or at once if the page loads scrolled): ScrollTrigger's first
  // measurement is a full-page layout we don't need to pay for while the page is still loading. At scroll 0 the
  // timeline's start state equals the static markup, so nothing changes visually.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    let ctx: gsap.Context | undefined;
    function build() {
      if (ctx) return;
      ensureScrollTrigger();
      ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => (progress.current = s.progress) } })
        .to(content.current, { yPercent: -35, opacity: 0, ease: 'none', duration: 0.6 }, 0)
        .to(trustRef.current, { opacity: 0, ease: 'none', duration: 0.3 }, 0)
        .to('.scroll-cue', { opacity: 0, ease: 'none', duration: 0.15 }, 0)
        .to(scrim.current, { opacity: 0, ease: 'none', duration: 0.35 }, 0.05)
        .fromTo(bloom.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.3 }, 0.05)
        .fromTo(glow.current, { opacity: 0 }, { opacity: 1, ease: 'power1.in', duration: 0.4 }, 0.22)
        .set({}, {}, 1); // timeline spans exactly 0..1 of the scroll
      }, section);
    }
    const stop = onFirstIntent(build);
    return () => { stop(); ctx?.revert(); };
  }, []);

  return (
    <section ref={section} id="home" data-theme="dark" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-deep text-white lg:min-h-[max(100svh,820px)]">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(120%_70%_at_50%_0%,#052149_0%,#01122B_42%,#000915_75%)]" />
      <div className="absolute inset-0 -z-10">
        {/* poster: a static planet horizon in the WebGL planet's colours and position, crossfades out when it's ready */}
        <div aria-hidden className={`hero-poster pointer-events-none absolute inset-0 transition-opacity duration-1000 ${glReady ? 'opacity-0' : 'opacity-100'}`} />
        {gl && <GlBoundary><Suspense fallback={null}><Globe progress={progress} onReady={() => setGlReady(true)} /></Suspense></GlBoundary>}
      </div>
      {/* bottom scrim keeps the trust marquee legible over the planet */}
      <div ref={scrim} className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent via-deep/70 to-deep/90" />
      {/* horizon glow that brightens on scroll and hands over to the light About section */}
      <div ref={bloom} className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[50%] opacity-0"
        style={{ background: 'radial-gradient(75% 85% at 50% 100%, rgba(60,140,255,.55), rgba(30,100,230,.22) 50%, transparent 78%)' }} />
      <div ref={glow} className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[40%] opacity-0"
        style={{ background: 'linear-gradient(to top, #FFFFFF 0%, #EAF3FF 8%, rgba(160,205,255,.6) 24%, transparent 60%)' }} />

      <div ref={content} className="container-site relative flex flex-col items-center pt-[clamp(8rem,17vh,11rem)] text-center">
        <p style={v({ delay: 0.3, dur: 0.9, rise: 12 })}
          className="intro-rise mb-6 max-w-[46ch] text-balance font-display text-[17px] font-medium leading-snug tracking-[-0.015em] text-[#8DB8EE] sm:text-[19px] lg:text-[21px]">
          <span className="text-grad-light font-semibold">{hero.kickerHighlight}</span>{hero.kicker.slice(hero.kickerHighlight.length)}
        </p>

        <h1 className="font-display text-[clamp(2.75rem,min(8vw,12.5vh),7rem)] font-semibold leading-[0.96] tracking-[-0.045em]" aria-label={hero.title.join(' ')}>
          <Words text={hero.title[0]} delay={0.45} />
          <Words text={hero.title[1]} delay={0.68} className="text-grad-light" />
        </h1>

        <p style={v({ delay: 1, rise: 14 })}
          className="intro-rise mt-6 max-w-[48ch] text-balance text-[17px] leading-relaxed text-[#B6C8E2] sm:text-[18px]">
          {hero.badge}.
        </p>

        <div style={v({ delay: 1.15, rise: 14 })}
          className="intro-rise mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <span className="relative inline-flex rounded-full">
            <Button href="#contact" className="w-full sm:w-auto">{hero.primary}</Button>
            <BorderBeam size={70} duration={6} borderWidth={1.5} colorFrom="#FFFFFF" colorTo="#9CCBFF" />
          </span>
          <Button href="#services" variant="glass" arrow={false}>{hero.secondary}</Button>
        </div>
      </div>

      {/* scroll cue */}
      <a href="#about" aria-label="Scroll to About" onClick={(e) => { e.preventDefault(); scrollToHash('#about'); }}
        style={v({ delay: 1.8 })}
        className="intro-fade scroll-cue absolute bottom-[132px] left-1/2 hidden h-11 w-7 -translate-x-1/2 justify-center rounded-full border border-white/20 pt-2 transition-colors hover:border-white/50 sm:flex [@media(max-height:760px)]:hidden">
        <span className="h-2 w-[3px] rounded-full bg-white/80" />
      </a>

      {/* trust marquee */}
      <div ref={trustRef} className="absolute inset-x-0 bottom-0 pb-6 sm:pb-8">
      <div className="intro-fade" style={v({ delay: 1.5, dur: 1.2 })}>
        <p className="mb-3.5 px-5 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8FB0DA]">{trust.title}</p>
        <div className="mx-auto max-w-site opacity-[.55] transition-opacity duration-500 [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)] hover:opacity-100">
          <Marquee duration={36} gap={0}>
            {trust.items.map((t) => (
              <span key={t} className="flex items-center whitespace-nowrap px-8 font-display text-[16px] font-medium tracking-[-0.01em] text-[#E3EEFC] after:ml-16 after:h-4 after:w-px after:bg-white/25 sm:text-[17px]">
                {t}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
      </div>
    </section>
  );
}
