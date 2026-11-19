import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE } from '@/components/ui';

/** Short branded intro (round 5, total ≤ 1.5s): the solid 3D logo scales / fades in, one white light sweep
 *  crosses it (masked to the logo shape), then the curtain lifts. Skipped for reduced-motion users.
 *  Timeline: logo 0–0.6s · sweep 0.4–1.0s · curtain 1.05–1.5s. The image is preloaded in index.html. */
const LOGO = '/img/brand/logo-3d-solid-256.webp';
const HOLD = 1050; // ms until the curtain starts lifting (curtain = 0.45s)

export default function Preloader() {
  const [done, setDone] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setDone(true), HOLD);
    return () => clearTimeout(t);
  }, [done]);
  const mask = { WebkitMaskImage: `url(${LOGO})`, maskImage: `url(${LOGO})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' } as const;
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="fixed inset-0 z-[200] flex items-center justify-center bg-deep" exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.45, ease: EASE }}>
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(3,97,219,.35),transparent)]" />
          <div className="relative flex flex-col items-center gap-6">
            <motion.div className="relative h-[112px] w-[115px]" initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: EASE }}>
              <img src={LOGO} alt="" width={256} height={249} decoding="async" draggable={false} className="no-save h-full w-full object-contain drop-shadow-[0_12px_28px_rgba(3,97,219,.45)]" />
              {/* single white light sweep, clipped to the logo */}
              <motion.div aria-hidden className="absolute inset-0" style={{ ...mask, backgroundImage: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,.85) 50%, transparent 65%)', backgroundSize: '250% 100%', backgroundRepeat: 'no-repeat' }}
                initial={{ backgroundPosition: '120% 0' }} animate={{ backgroundPosition: '-20% 0' }} transition={{ duration: 0.6, delay: 0.4, ease: [0.45, 0, 0.25, 1] }} />
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
              className="font-display text-[12px] font-semibold uppercase tracking-[0.3em] text-white/70">Passionate Global</motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
