import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE } from '@/components/ui';

/** Short branded intro (≈1.4s). Skipped for reduced-motion users. */
export default function Preloader() {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (done) return;
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => { const p = Math.min(1, (t - t0) / 1200); setN(Math.round(100 * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step); else setTimeout(() => setDone(true), 180); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [done]);
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="fixed inset-0 z-[200] flex items-center justify-center bg-deep" exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.9, ease: EASE }}>
          <div className="flex flex-col items-center gap-6">
            <motion.img src="./img/logo-mark-light.png" alt="" className="h-16 w-auto" initial={{ scale: 0.6, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: 0.9, ease: EASE }} />
            <div className="h-[2px] w-48 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-sky to-brand" style={{ width: `${n}%` }} /></div>
            <p className="font-display text-[12px] font-semibold uppercase tracking-[0.3em] text-white/60">Passionate Global · <span className="tabular-nums text-white">{n}</span></p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
