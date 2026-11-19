import { useEffect, useRef, useState } from 'react';

/** Short branded intro (round 5, total ≤ 1.5s): the solid 3D logo scales / fades in, one white light sweep
 *  crosses it (masked to the logo shape), then the curtain lifts. Skipped for reduced-motion users (CSS).
 *  Timeline: logo 0–0.6s · sweep 0.4–1.0s · curtain 1.05–1.5s.
 *  Launch 4: pure CSS (.pre-* in index.css), so it plays from the first paint of the pre-rendered HTML; React only
 *  removes the finished overlay from the DOM. The image is preloaded in index.html. */
const LOGO = '/img/brand/logo-3d-solid-256.webp';

export default function Preloader() {
  const [done, setDone] = useState(false);
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    // already finished before hydration (or hidden by reduced motion) → remove now; otherwise on animationend
    const curtain = node.getAnimations?.().find((a) => (a as CSSAnimation).animationName === 'pre-curtain');
    if (!curtain || curtain.playState === 'finished' || getComputedStyle(node).display === 'none') { setDone(true); return; }
    const end = (e: AnimationEvent) => { if (e.animationName === 'pre-curtain') setDone(true); };
    node.addEventListener('animationend', end);
    return () => node.removeEventListener('animationend', end);
  }, []);
  if (done) return null;
  const mask = { WebkitMaskImage: `url(${LOGO})`, maskImage: `url(${LOGO})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' } as const;
  return (
    <div ref={el} id="preloader" aria-hidden className="pre-curtain fixed inset-0 z-[200] flex items-center justify-center bg-deep">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(3,97,219,.35),transparent)]" />
      <div className="relative flex flex-col items-center gap-6">
        <div className="pre-logo relative h-[112px] w-[115px]">
          <img src={LOGO} alt="" width={256} height={249} decoding="async" draggable={false} className="no-save h-full w-full object-contain drop-shadow-[0_12px_28px_rgba(3,97,219,.45)]" />
          {/* single white light sweep, clipped to the logo */}
          <div className="pre-sweep absolute inset-0" style={{ ...mask, backgroundImage: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,.85) 50%, transparent 65%)', backgroundSize: '250% 100%', backgroundRepeat: 'no-repeat' }} />
        </div>
        <p className="intro-rise font-display text-[12px] font-semibold uppercase tracking-[0.3em] text-white/70" style={{ ['--rise' as string]: '6px', ['--dur' as string]: '.5s', ['--delay' as string]: '.25s' }}>Passionate Global</p>
      </div>
    </div>
  );
}
