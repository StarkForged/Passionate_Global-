/**
 * Process — reference: ref3 (wave line, hexagon icon nodes, big faded numerals).
 * Desktop: the section pins and the wave scrolls horizontally, drawing itself as you go.
 * Mobile / reduced motion: vertical timeline.
 */
import { useLayoutEffect, useRef } from 'react';
import { Search, Layers, UserCheck, Rocket, Headset, TrendingUp } from 'lucide-react';
import { process as proc } from '@/data/content';
import { Button, Reveal, SectionHeader } from '@/components/ui';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/scroll';

const icons = [Search, Layers, UserCheck, Rocket, Headset, TrendingUp];
const HEX = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)';

// Track geometry (desktop)
const STEP_W = 430, PAD = 240, H = 540, MID = 270, AMP = 72, END = 620;
const LAST_X = PAD + STEP_W * (proc.steps.length - 1);
const TRACK_W = LAST_X + END;
const yAt = (x: number) => MID - AMP * Math.sin(((x - PAD) / STEP_W) * Math.PI + Math.PI / 2);
const PATH = (() => { let d = `M0,${yAt(0).toFixed(1)}`; for (let x = 8; x <= TRACK_W; x += 8) d += ` L${x},${yAt(x).toFixed(1)}`; return d; })();

export default function Process() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const line = useRef<SVGPathElement>(null);
  const glow = useRef<SVGPathElement>(null);
  const progress = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const nodes = gsap.utils.toArray<HTMLElement>('.proc-step');
      const dist = () => Math.max(0, TRACK_W - window.innerWidth + 120);
      [line.current!, glow.current!].forEach((p) => { p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: pin.current, start: 'top top', end: () => `+=${dist() + window.innerHeight * 0.6}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      tl.to(track.current, { x: () => -dist(), ease: 'none', duration: 1 }, 0)
        .to([line.current, glow.current], { strokeDashoffset: 0.08, ease: 'none', duration: 1 }, 0)
        .to(progress.current, { scaleX: 1, ease: 'none', duration: 1 }, 0);
      nodes.forEach((n, i) => {
        const at = (PAD + i * STEP_W) / TRACK_W;
        tl.to(n, { '--on': 1, duration: 0.05, ease: 'power2.out' } as gsap.TweenVars, Math.max(0, at - 0.12));
      });
      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    });
    const t = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => { mm.revert(); clearTimeout(t); };
  }, []);

  return (
    <section ref={section} id="process" data-theme="light" className="relative bg-ice">
      {/* ---------- desktop: pinned horizontal wave ---------- */}
      <div ref={pin} className="relative hidden h-screen min-h-[760px] flex-col overflow-hidden lg:flex">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-70 [mask-image:radial-gradient(70%_60%_at_50%_60%,#000,transparent)]" />
        <div className="container-site relative pt-[88px]">
          <div className="flex items-end justify-between gap-10">
            <SectionHeader align="left" tag={proc.eyebrow} title={proc.title} highlight={['Lasting']} className="max-w-[640px]" />
            <div className="max-w-[420px] pb-2">
              <p className="lead">{proc.intro}</p>
              <div className="mt-6 h-[3px] w-full overflow-hidden rounded-full bg-navy/[0.06]"><div ref={progress} className="h-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-ocean to-brand" /></div>
            </div>
          </div>
        </div>
        <div className="relative mt-4 flex-1">
          <div ref={track} className="absolute left-0 top-1/2 -translate-y-1/2 will-change-transform" style={{ width: TRACK_W, height: H }}>
            <svg width={TRACK_W} height={H} className="absolute inset-0 overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="wgrad" x1="0" x2="1"><stop offset="0" stopColor="#5AA5FF" /><stop offset=".5" stopColor="#1679E0" /><stop offset="1" stopColor="#0361DB" /></linearGradient>
                <filter id="wglow" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
              </defs>
              <path d={PATH} fill="none" stroke="rgba(1,21,45,.08)" strokeWidth="2" />
              <path ref={glow} d={PATH} fill="none" stroke="url(#wgrad)" strokeWidth="8" opacity=".3" filter="url(#wglow)" pathLength={1} />
              <path ref={line} d={PATH} fill="none" stroke="url(#wgrad)" strokeWidth="3.5" strokeLinecap="round" pathLength={1} />
            </svg>
            {proc.steps.map((s, i) => {
              const x = PAD + i * STEP_W, y = yAt(x), up = y < MID; const Icon = icons[i];
              return (
                <div key={s.title} className="proc-step absolute" style={{ left: x, top: y, ['--on' as string]: 0 } as React.CSSProperties}>
                  {/* glow */}
                  <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(3,97,219,.35),transparent_65%)]" style={{ opacity: 'calc(.25 + var(--on) * .75)' }} />
                  {/* node */}
                  <div className="absolute left-1/2 top-1/2 h-[76px] w-[68px] -translate-x-1/2 -translate-y-1/2" style={{ transform: 'translate(-50%,-50%) scale(calc(.9 + var(--on) * .15))' }}>
                    <div className="absolute inset-0 bg-white shadow-lift" style={{ clipPath: HEX }} />
                    <div className="absolute inset-0 bg-[linear-gradient(160deg,#3D8FF5,#0361DB_60%,#0240A0)]" style={{ clipPath: HEX, opacity: 'var(--on)' }} />
                    <div className="absolute inset-0 grid place-items-center" style={{ color: 'color-mix(in srgb, #fff calc(var(--on) * 100%), #0361DB)' }}><Icon className="h-7 w-7" strokeWidth={1.7} /></div>
                  </div>
                  {/* text */}
                  <div className="absolute left-1/2 w-[340px] -translate-x-1/2" style={up ? { bottom: 58 } : { top: 58 }}>
                    <span className="pointer-events-none absolute left-1/2 -z-0 -translate-x-1/2 font-display text-[150px] font-bold leading-none tracking-[-0.06em] text-navy/[0.045]" style={up ? { bottom: -30 } : { top: -40 }}>0{i + 1}</span>
                    <div className="relative text-center" style={{ opacity: 'calc(.45 + var(--on) * .55)' }}>
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">Step 0{i + 1}</p>
                      <h3 className="font-display text-[26px] font-semibold tracking-[-0.03em] text-ink">{s.title}</h3>
                      <p className="mx-auto mt-3 max-w-[34ch] text-[15px] leading-relaxed text-muted">{s.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* end CTA */}
            <div className="absolute -translate-y-1/2" style={{ left: LAST_X + 300, top: MID }}>
              <div className="relative grid h-[260px] w-[260px] place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#5AA5FF,#0361DB_55%,#01152D)] text-center text-white shadow-[0_40px_80px_-30px_rgba(3,97,219,.8)]">
                <span className="absolute inset-[-14px] rounded-full border border-brand/20" />
                <span className="absolute inset-[-34px] rounded-full border border-brand/10" />
                <div className="px-8">
                  <p className="font-display text-[22px] font-semibold leading-tight tracking-[-0.02em]">{proc.cta}</p>
                  <Button href="#contact" variant="light" size="sm" className="mt-5">Start now</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- mobile / tablet: vertical timeline ---------- */}
      <div className="section lg:hidden">
        <div className="container-site">
          <SectionHeader tag={proc.eyebrow} title={proc.title} intro={proc.intro} highlight={['Lasting']} />
          <ol className="relative mx-auto mt-14 max-w-[640px] pl-14">
            <span className="absolute bottom-6 left-[26px] top-6 w-[2px] rounded-full bg-gradient-to-b from-sky via-ocean to-brand" />
            {proc.steps.map((s, i) => {
              const Icon = icons[i];
              return (
                <Reveal key={s.title} delay={i * 0.04} className="relative mb-4">
                  <li className="rounded-3xl border border-line bg-white p-6 shadow-soft">
                    <span className="absolute -left-14 top-6 grid h-[56px] w-[52px] place-items-center bg-grad text-white" style={{ clipPath: HEX }}><Icon className="h-6 w-6" strokeWidth={1.7} /></span>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">Step 0{i + 1}</p>
                    <h3 className="mt-1 font-display text-[22px] font-semibold tracking-[-0.03em]">{s.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
                  </li>
                </Reveal>
              );
            })}
          </ol>
          <div className="mt-10 flex justify-center"><Button href="#contact">{proc.cta}</Button></div>
        </div>
      </div>
    </section>
  );
}
